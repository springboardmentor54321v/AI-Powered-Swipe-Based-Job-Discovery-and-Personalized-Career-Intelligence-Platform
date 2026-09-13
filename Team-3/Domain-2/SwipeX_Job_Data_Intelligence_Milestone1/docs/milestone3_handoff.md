# Milestone 3 Handoff: Resume and ATS Intelligence

## Usable inputs

The AI/ML Career Intelligence module can consume the following Job & Data fields immediately:

- Job title and cleaned description.
- Normalized skills array.
- Location and remote flag.
- Minimum and maximum experience.
- Salary range only when disclosed.
- Company type, company industry when enriched, freshness, and competition level.
- User swipe history: applied, saved, and skipped jobs.

## Recommended heuristic-to-ML transition

1. Keep the Day 2 heuristic feature names stable: skills overlap, location fit, experience fit, freshness, and competition.
2. Log feature values and ranked-job impressions with a privacy-reviewed event model before training. Do not use an application action as a negative label simply because no later action was observed.
3. Add parsed-resume skills only after the resume service establishes its consent, retention, and versioning policy.
4. Build ATS compatibility from transparent component scores: required-skill coverage, preferred-skill coverage, experience fit, and keyword evidence. Return explanations alongside scores.
5. Evaluate by ranking quality and calibration across experience bands, locations, and company types; do not optimize only click or swipe rate.

## Data gaps to resolve before model training

- `job_type` needs an approved source or a reviewed classification pipeline.
- Company `about`, size, and industry need curated enrichment.
- Relative posting dates are inferred from a declared reference time, not source timestamps.
- Salary is undisclosed for many listings and must remain missing rather than zero.
- User preference signals need consented, privacy-reviewed event retention.
