-- Funnel by job and day
SELECT day, sum(applications) applications, sum(saved) saved, sum(applied) applied,
       sum(shortlisted) shortlisted, sum(interview) interview, sum(rejected) rejected
FROM app.daily_funnel_aggregate WHERE job_id = $1 AND day BETWEEN $2 AND $3 GROUP BY day ORDER BY day;

-- Resume performance, weighted across a date range
SELECT job_id, sum(application_count) application_count,
       round(sum(average_resume_score * application_count) / nullif(sum(application_count),0),2) weighted_resume_score,
       round(sum(interview_rate * application_count) / nullif(sum(application_count),0),4) interview_rate,
       round(sum(hire_rate * application_count) / nullif(sum(application_count),0),4) hire_rate
FROM app.daily_resume_performance_aggregate WHERE day BETWEEN $1 AND $2 GROUP BY job_id ORDER BY hire_rate DESC NULLS LAST;

-- Skills-demand analytics are unavailable until job skill normalization is
-- added to the integrated schema. Do not query nonexistent skill tables.

-- Hiring trend
SELECT * FROM app.daily_hiring_trend_aggregate WHERE day BETWEEN $1 AND $2 ORDER BY day;

-- Candidate skill-gap analytics remain unavailable until normalized candidate
-- and job skill relations are part of the production schema.
