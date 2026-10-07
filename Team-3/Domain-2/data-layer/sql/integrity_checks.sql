-- Each query must return zero rows before sign-off.
SELECT j.id, j.applicant_count, count(a.id)::integer actual_count
FROM public.jobs j LEFT JOIN public.applications a ON a.job_id=j.id
GROUP BY j.id, j.applicant_count HAVING j.applicant_count <> count(a.id)::integer;

SELECT n.id FROM app.notification n WHERE n.read_at IS NOT NULL AND n.read_at < n.created_at;
SELECT e.id FROM app.application_status_event e JOIN public.applications a ON a.id=e.application_id
WHERE e.job_id <> a.job_id OR e.applicant_id <> a.applicant_id;
SELECT * FROM app.daily_funnel_aggregate WHERE applications < screened OR screened < interviewed OR interviewed < offered OR offered < hired;
