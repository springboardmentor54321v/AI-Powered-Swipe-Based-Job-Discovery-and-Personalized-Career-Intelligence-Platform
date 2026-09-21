# MILESTONE 4: HANDOFF NOTIFICATION & ANALYTICS

**IMPORTANT MILESTONE 4 BOUNDARY**: 
This document *only* specifies what outputs Intern 4 provides. Milestone 4 analytics/notifications are NOT implemented in this repository per SRS instructions.

## 1. Available Intern 4 Outputs for Analytics

### Resume & ATS Scoring Outputs
Milestone 4 database/analytics pipelines can consume the following generated properties from ATS scoring endpoints:
- **`match_score`**: The blended overall ATS + Semantic compatibility percentage.
- **`keyword_score`**: The literal rule-based deterministic keyword matching score.
- **`semantic_score`**: Dense vector evaluation similarity score (ChromaDB `all-MiniLM-L6-v2`).
- **`matched_skills`** & **`missing_skills`**: Trackable skill gap representations for analytics.
- **`matched_keywords`** & **`missing_keywords`**: Contextual text metadata overlaps.

*Example Future Analytics Use-Case*: Plotting candidate skill-gap trends over time to visualize ATS score history as they upload better resumes.

### Recommendation Outputs
Milestone 4 user consumption dashboards can track:
- **`match_percentage`**: Ultimate recommended heuristic score dynamically incorporating swipe boundaries.
- **`reasons`**: List of tags (e.g., "Recently posted", "Low competition", "Based on your swipe history").
- **Swipe-History Influence Parameters**: Modifiers injected into standard algorithms due to historical user actions mapping (can be aggregated for demographic insights).

*Example Future Analytics Use-Case*: Logging Recommendation interaction trends by mapping if users swipe LEFT primarily on "Matches your experience" jobs.

### System & Suggestion Outputs
- **Resume Optimization Suggestions**: List of strings containing granular advice (missing skills, keywords, low ATS boundaries).
- **Suggestion Categories**: Differentiable between skills, keywords, and general coverage fallbacks.

*Example Future Analytics Use-Case*: Tracking Suggestion adoption (e.g. if a candidate updates their resume matching a prior missing skill suggestion).

## 2. Available Intern 4 Outputs for Notifications

Future Notification engines (Email, Push, SMS, Cron-jobs) built in Milestone 4 can parse AI outputs to trigger asynchronous alerts:

- **Resume Improvement Reminders**: Triggered if a candidate uploads a resume scoring persistently below `<50%`.
- **Skill-Gap Notifications**: Automated weekly digest highlighting `missing_skills` highly recurring across saved jobs.
- **Recommendation Updates**: Alerts explicitly pushed when new backend jobs match existing `<user_profile>` requirements heavily due to semantic embedding triggers.
- **Career-Readiness Updates**: Prompting candidates that their updated resume has generated entirely new heuristic match profiles.

**Note**: All actual Cron, Mailgun/Sendgrid, Push-Notification logic forms the foundation of Intern 6 / Milestone 4 tasks.
