-- Funnel by job and day
SELECT day, sum(applications) applications, sum(screened) screened, sum(interviewed) interviewed,
       sum(offered) offered, sum(hired) hired
FROM app.daily_funnel_aggregate WHERE job_id = $1 AND day BETWEEN $2 AND $3 GROUP BY day ORDER BY day;

-- Resume performance, weighted across a date range
SELECT job_id, sum(application_count) application_count,
       round(sum(average_resume_score * application_count) / nullif(sum(application_count),0),2) weighted_resume_score,
       round(sum(interview_rate * application_count) / nullif(sum(application_count),0),4) interview_rate,
       round(sum(hire_rate * application_count) / nullif(sum(application_count),0),4) hire_rate
FROM app.daily_resume_performance_aggregate WHERE day BETWEEN $1 AND $2 GROUP BY job_id ORDER BY hire_rate DESC NULLS LAST;

-- Skills in demand. Requires public.job_skills(job_id uuid, skill_id uuid) and public.skills(id uuid, name text).
SELECT s.name, count(DISTINCT js.job_id) open_jobs, sum(j.applicant_count) applicant_demand
FROM public.job_skills js JOIN public.skills s ON s.id=js.skill_id JOIN public.jobs j ON j.id=js.job_id
WHERE j.status='open' GROUP BY s.name ORDER BY open_jobs DESC, applicant_demand DESC LIMIT $1;

-- Hiring trend
SELECT * FROM app.daily_hiring_trend_aggregate WHERE day BETWEEN $1 AND $2 ORDER BY day;

-- Candidate recommendation insights: candidate's matching skills and lower-competition openings.
-- Requires public.user_skills(user_id uuid, skill_id uuid).
SELECT j.id, j.title, j.competition_level, count(*) matched_skills,
       round(count(*)::numeric / nullif((SELECT count(*) FROM public.job_skills x WHERE x.job_id=j.id),0), 3) skill_match
FROM public.jobs j JOIN public.job_skills js ON js.job_id=j.id
JOIN public.user_skills us ON us.skill_id=js.skill_id AND us.user_id=$1
WHERE j.status='open' GROUP BY j.id, j.title, j.competition_level
ORDER BY skill_match DESC, j.applicant_count ASC, j.created_at DESC LIMIT $2;
