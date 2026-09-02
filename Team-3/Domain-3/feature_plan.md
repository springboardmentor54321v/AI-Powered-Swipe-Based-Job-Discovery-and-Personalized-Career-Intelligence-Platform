# Feature Plan — Resume-to-Job Matching (Milestone 1, Heuristic Version)

## Objective
Identify what information should be compared between a resume and a job 
description to produce a simple, rule-based match score (no AI model in M1).

## Information to Extract & Compare

1. Skills — technical skills in resume vs skills required by job (e.g. Python, SQL, React)
2. Keywords — important terms from job description that also appear in resume
3. Experience level — years of experience mentioned vs job's required experience
4. Job title / role similarity — past job titles vs the target job title
5. Education (optional) — degree/field match, if time permits

## Scoring Approach (Milestone 1 — heuristic only)
match_score = (number of matching skills/keywords found) / (total skills/keywords required) x 100

## Explicitly Out of Scope for Milestone 1
- Understanding meaning/synonyms (e.g. "ML" = "Machine Learning")
- Weighting important skills higher than others
- Any trained AI/NLP model — reserved for Milestone 2