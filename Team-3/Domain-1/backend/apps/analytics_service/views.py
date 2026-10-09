from datetime import timedelta

from django.db import connection
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


def _role(user):
    role = getattr(user, "role", None)
    return str(getattr(role, "name", role or "")).lower()


def _date_cutoff(request):
    days = request.query_params.get("days", "30")
    if days == "all":
        return None
    try:
        days = int(days)
    except ValueError:
        days = 30
    return timezone.now() - timedelta(days=max(1, min(days, 3650)))


def _funnel_rows(where_sql, params):
    with connection.cursor() as cursor:
        cursor.execute(
            f"""SELECT a.status, count(*)
                FROM public.applications a {where_sql}
                GROUP BY a.status""",
            params,
        )
        return dict(cursor.fetchall())


class SeekerAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: dict})
    def get(self, request):
        if _role(request.user) != "job_seeker":
            return Response(status=403)
        cutoff = _date_cutoff(request)
        where = "WHERE a.applicant_id = %s"
        params = [request.user.id]
        if cutoff:
            where += " AND a.created_at >= %s"
            params.append(cutoff)
        funnel_counts = _funnel_rows(where, params)
        from apps.resume_service.models import ResumeSkill, ResumeVersion
        candidate_skills = set()
        latest_version = ResumeVersion.objects.filter(
            resume__owner=request.user,
        ).order_by("-version_number").first()
        if latest_version:
            candidate_skills = {
                name.strip().lower()
                for name in ResumeSkill.objects.filter(resume_version=latest_version)
                .values_list("skill__normalized_name", flat=True)
            }
        with connection.cursor() as cursor:
            cursor.execute(
                f"""SELECT DISTINCT j.skills FROM public.jobs j
                    JOIN public.applications a ON a.job_id = j.id {where}""",
                params,
            )
            target_skills = {
                skill.strip().lower()
                for (raw_skills,) in cursor.fetchall()
                for skill in (raw_skills or "").split("|")
                if skill.strip()
            }
        with connection.cursor() as cursor:
            performance_where = "AND a.created_at >= %s" if cutoff else ""
            performance_params = [request.user.id] + ([cutoff] if cutoff else [])
            cursor.execute(
                f"""SELECT rv.id, coalesce(rv.label, rv.original_filename),
                           count(a.id) FILTER (WHERE a.status <> 'saved'),
                           count(a.id) FILTER (WHERE a.status = 'shortlisted'),
                           round(avg(a.resume_score)::numeric, 2)
                    FROM public.resume_versions rv
                    JOIN public.resumes r ON r.id = rv.resume_id
                    LEFT JOIN public.applications a ON a.resume_version_id = rv.id
                      AND a.applicant_id = r.owner_id {performance_where}
                    WHERE r.owner_id = %s
                    GROUP BY rv.id, rv.label, rv.original_filename, rv.version_number
                    ORDER BY rv.version_number DESC""",
                ([cutoff, request.user.id] if cutoff else [request.user.id]),
            )
            performance = [
                {
                    "resume_version_id": str(version_id),
                    "version_name": name,
                    "views": 0,
                    "applies": applies,
                    "shortlists": shortlists,
                    "avg_score": float(score) if score is not None else None,
                }
                for version_id, name, applies, shortlists, score in cursor.fetchall()
            ]
        return Response({
            "application_funnel": {
                "saved": funnel_counts.get("saved", 0),
                "applied": funnel_counts.get("applied", 0),
                "shortlisted": funnel_counts.get("shortlisted", 0),
                "interview": funnel_counts.get("interview", 0),
                "rejected": funnel_counts.get("rejected", 0),
            },
            # Job views aren't logged yet; the remaining measures are grouped
            # by the resume version attached when the application was submitted.
            "resume_performance": performance,
            "skill_gaps": {
                "matched_skills": sorted(candidate_skills & target_skills),
                "missing_skills": sorted(target_skills - candidate_skills),
            },
            "period_days": request.query_params.get("days", "30"),
        })


class RecruiterFunnelView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: dict})
    def get(self, request):
        if _role(request.user) != "recruiter":
            return Response(status=403)
        job_id = request.query_params.get("job_id")
        cutoff = _date_cutoff(request)
        conditions = ["j.recruiter_id = %s"]
        params = [request.user.id]
        if job_id:
            try:
                params.append(int(job_id))
            except ValueError:
                return Response({"detail": "job_id must be an integer"}, status=400)
            conditions.append("j.id = %s")
            if int(job_id) not in owned_job_ids(request.user.id):
                return Response(status=403)
        if cutoff:
            conditions.append("a.created_at >= %s")
            params.append(cutoff)
        where = "WHERE " + " AND ".join(conditions)
        with connection.cursor() as cursor:
            cursor.execute(
                f"""SELECT a.status, count(*) FROM public.applications a
                    JOIN public.jobs j ON j.id = a.job_id {where}
                    GROUP BY a.status""",
                params,
            )
            counts = dict(cursor.fetchall())
            cursor.execute(
                "SELECT count(*) FROM public.jobs WHERE recruiter_id = %s" +
                (" AND id = %s" if job_id else ""),
                [request.user.id] + ([int(job_id)] if job_id else []),
            )
            job_count = cursor.fetchone()[0]
        return Response({
            "job_id": job_id,
            "jobs": job_count,
            "funnel": {key: counts.get(key, 0) for key in ("saved", "applied", "shortlisted", "interview", "rejected")},
            "period_days": request.query_params.get("days", "30"),
        })


class AdminTrendsView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: dict})
    def get(self, request):
        if _role(request.user) != "admin":
            return Response(status=403)
        cutoff = _date_cutoff(request)
        where = "WHERE j.posted_at >= %s" if cutoff else ""
        params = [cutoff] if cutoff else []
        with connection.cursor() as cursor:
            cursor.execute(
                f"""SELECT c.company_type, count(*) FROM public.jobs j
                    JOIN public.companies c ON c.id=j.company_id {where}
                    GROUP BY c.company_type""",
                params,
            )
            company_types = dict(cursor.fetchall())
            cursor.execute(
                f"""SELECT date_trunc('day', j.posted_at)::date, count(*)
                    FROM public.jobs j {where}
                    GROUP BY 1 ORDER BY 1""",
                params,
            )
            jobs_by_day = [{"day": day.isoformat(), "jobs_posted": count} for day, count in cursor.fetchall()]
            cursor.execute(
                f"""SELECT trim(skill), count(*)
                    FROM public.jobs j
                    CROSS JOIN LATERAL unnest(string_to_array(coalesce(j.skills, ''), '|')) AS skills(skill)
                    {where if where else 'WHERE true'}
                    AND trim(skill) <> ''
                    GROUP BY trim(skill) ORDER BY count(*) DESC, trim(skill) LIMIT 10""",
                params,
            )
            top_skills = [{"skill": skill, "count": count} for skill, count in cursor.fetchall()]
            cursor.execute("SELECT count(*) FROM public.jobs" + (" WHERE posted_at >= %s" if cutoff else ""), params)
            job_total = cursor.fetchone()[0]
        total_jobs = sum(company_types.values())
        startup = sum(count for name, count in company_types.items() if "startup" in name.lower())
        return Response({
            "jobs_posted": job_total,
            "hiring_activity_by_company_type": {
                "counts": company_types,
                "startup_share_pct": round(100 * startup / total_jobs, 2) if total_jobs else 0,
            },
            "startup_percentage": round(100 * startup / total_jobs, 2) if total_jobs else 0,
            "top_skills": top_skills,
            "jobs_by_day": jobs_by_day,
            "period_days": request.query_params.get("days", "30"),
        })
