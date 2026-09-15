# SwipeX Matching Engine — Scoring Methodology
**Milestone 2 — Intern 4 (AI/ML Career Intelligence)**
**Status:** Heuristic v0 (rule-based placeholder, per Milestone 2 scope)

---

## 1. Overview

The Matching Engine ranks jobs for a user by scoring every job in the
catalog against the user's profile and past behavior, then returning
the top 10 highest-scoring jobs. Each recommendation includes a
`match_score` (0-100) and a list of `reason_tags` explaining why the
job was recommended.

This is a **heuristic (rule-based) system**, not a trained machine
learning model. It uses fixed formulas and thresholds rather than
learned patterns. The full NLP/ML-driven, ATS-aware ranking model is
scoped for Milestone 3.

---

## 2. The Four Scoring Factors

Every job is scored against four factors, each contributing a
weighted percentage to the final `match_score`:

| Factor | Weight | What It Measures |
|---|---|---|
| Skills | 35% | How well the user's stated skills overlap with the job's required skills |
| Location | 20% | Whether the job's location matches the user's preferred location |
| Experience | 20% | Whether the user's years of experience fit the job's required range |
| Swipe History | 25% | Whether the job is similar to jobs the user previously applied to, saved, or skipped |

**Formula:**
```
match_score = (0.35 × skills_score)
            + (0.20 × location_score)
            + (0.20 × experience_score)
            + (0.25 × swipe_score)
```

### Why these weights?
Skills carries the largest single weight because it is the most
direct signal of whether a person is actually qualified for a role —
a skills mismatch is often disqualifying outright, while location and
experience are comparatively flexible (remote work, slightly
under/over the experience band, etc.). Swipe history was raised from
an initial 20% to 25% after Day 3 testing showed the personalization
signal was too diluted at a lower weight; the difference was taken
from skills (lowered from an initial 40% to 35%).

These weights were set through logical reasoning and manual testing,
not statistical optimization — there is currently no labeled dataset
or real user outcome data to validate them empirically. This is an
acknowledged limitation of the heuristic v0 stage.

---

## 3. How Each Factor Is Calculated

### 3.1 Skills Score
Compares the user's stated skills against the job's listed skills
using **substring matching** — checking if one skill string appears
inside the other (e.g., "python" matches "Python Developer"). This
was upgraded from exact string matching after testing revealed real
job listings rarely use single, clean skill words, causing valid
matches to be missed entirely under strict equality.

This does not catch true synonyms (e.g., "people management" vs.
"team leadership") — that requires semantic/NLP-based matching,
which is scoped for Milestone 3.

### 3.2 Location Score
A simple check: does the user's typed location appear within the
job's listed location string. Binary — 100 if found, 0 if not.

### 3.3 Experience Score
Uses a **graduated scale** rather than a hard cutoff:
- If the user's experience falls within the job's min-max range: 100
- If below the minimum: score decreases proportionally to how far
  short they are (20 points lost per year short)
- If above the maximum: score decreases more gently (10 points lost
  per year over), since being overqualified is a softer mismatch
  than being underqualified

This replaced an earlier binary (0 or 100) approach, which treated a
candidate 0.1 years short of the minimum identically to a candidate
with zero relevant experience — an unrealistic "cliff-edge" effect.

### 3.4 Swipe History Score
Compares the skills of the job currently being scored against the
skills of jobs the user previously **applied to or saved** (boosts
the score) and jobs they **skipped** (lowers the score). This is
skill-overlap based, not exact job-ID matching — a user will never be
re-shown a job they've already swiped on, so matching by identical
job ID would provide no value for recommending new jobs. Any job the
user has already swiped on (in any direction) is filtered out of the
results entirely before scoring/ranking.

---

## 4. Reason Tags

Alongside the numeric score, each recommendation includes
human-readable reason tags:

| Tag | Trigger Condition |
|---|---|
| "Matches your skills" | Skills score above 50 |
| "In your preferred location" | Exact location match |
| "Similar to jobs you liked" | Meaningful skill overlap with a previously applied/saved job |
| "Similar to jobs you skipped" | Meaningful skill overlap with a previously skipped job |
| "Recently posted" | Job posted within the last 5 days |
| "Low competition" | Job's applicant-based competition level is "Low" |

---

## 5. Data Sources (Current Status)

| Data Needed | Source | Status |
|---|---|---|
| Job catalog (skills, location, experience) | Intern 3's seeded dataset | Live |
| Swipe history (applied/saved/skipped) | Intern 2's Swipe Service | **Mocked** — real API not yet available; built behind a swappable function so integration requires no logic changes once live |
| Job freshness & competition level | Intern 3's Job Service | **Mocked** — real fields not yet exposed; same swappable-interface pattern used |

---

## 6. Known Limitations (Heuristic v0)

- Skill matching is text-based (substring), not semantic — cannot
  detect true synonyms or related-but-differently-worded skills
- Weights were tuned by observation, not statistically validated
  against real outcome data
- Swipe-history and freshness/competition signals rely on mock data
  pending upstream services going live
- No handling yet for skill importance/seniority (all matched skills
  are treated equally, regardless of how critical they are to the role)
