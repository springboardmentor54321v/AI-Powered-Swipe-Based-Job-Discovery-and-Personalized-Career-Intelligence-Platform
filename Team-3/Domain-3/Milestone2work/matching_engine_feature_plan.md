# Matching Engine — Feature Plan & Scoring Formula v0
## Milestone 2, Day 1

## Objective
Define what makes a job a "good match" for a user, and design a simple 
rule-based scoring formula to rank jobs in the swipe feed.

## Matching Factors

1. **Skills Overlap** — how many of the user's profile skills match the 
   job's required skills
2. **Location Match** — does the job's location match the user's preferred 
   location (or is it remote)
3. **Experience Fit** — does the user's experience level fall within the 
   job's required experience range
4. **Swipe History Signal** — jobs similar to ones the user has previously 
   swiped right on (liked/saved) should rank higher; jobs similar to skipped 
   ones should rank lower

## Scoring Formula v0 (heuristic, weighted)

Where:
- skills_overlap_percentage = (matching skills / total required skills) x 100
- location_match_score = 100 if exact/remote match, 50 if same city/state, 0 if no match
- experience_fit_score = 100 if user's experience falls within job's range, 
  scaled down the further outside the range
- swipe_history_score = based on similarity to previously liked jobs (skills/company type overlap)

## Data Fields Needed From Intern 3 (to confirm with them)

- job.skills_required (list)
- job.location
- job.experience_min / job.experience_max
- job.company_type (MNC / Startup / Newly Founded)
- user.profile_skills
- user.preferred_location
- user.experience_level
- swipe_history (job_id, direction, timestamp) — per user

## Out of Scope for Milestone 2
- Real ML-based scoring (trained model) — reserved for Milestone 3
- NLP-based skill similarity (e.g. "ML" = "Machine Learning") — reserved for Milestone 3