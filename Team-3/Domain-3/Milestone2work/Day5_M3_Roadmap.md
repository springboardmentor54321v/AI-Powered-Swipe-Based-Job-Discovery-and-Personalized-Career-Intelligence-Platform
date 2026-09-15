# Milestone 3 Roadmap Note — From Heuristic Matching to AI/ML-Driven Ranking
**Prepared by:** Intern 4 (AI/ML Career Intelligence)
**Milestone 2 Scope Boundary:** This document confirms the current
Matching Engine is a rule-based heuristic, and outlines how it will
evolve into a trained AI/ML model in Milestone 3.

---

## 1. What Exists Today (Milestone 2 — Heuristic v0)

The current Matching Engine ranks jobs using **fixed formulas and
manually-set weights** across four factors: skills (substring text
matching), location (exact match), experience (graduated scale), and
swipe history (skill-overlap comparison against past likes/skips).
Scores are computed the same way for every user — there is no
learning, adaptation, or training involved. This is explicitly
scoped as a placeholder per the Milestone 2 SRS: *"a rule-based
placeholder ahead of the real NLP/ML-driven, ATS-aware ranking
scheduled for Milestone 3."*

---

## 2. What Changes in Milestone 3

### 2.1 Skill Matching → Semantic/NLP-Based Matching
**Current limitation:** Substring matching only catches skills that
share literal overlapping text (e.g., "python" / "Python Developer").
It cannot recognize that "people management" and "team leadership"
describe a similar capability.

**Milestone 3 plan:** Replace text matching with embedding-based
semantic similarity (e.g., sentence embeddings via a pretrained NLP
model) so skills are compared by *meaning*, not exact wording.

### 2.2 Resume-Aware, ATS-Style Scoring
**Current limitation:** The engine only uses skills typed manually
into the API request — it has no concept of a full resume, work
history, or ATS-style keyword/structure scoring.

**Milestone 3 plan:** Integrate with the resume parsing/ATS module to
score candidates against actual resume content, closer to how
real applicant tracking systems evaluate fit.

### 2.3 Fixed Weights → Learned Weights
**Current limitation:** The 35/20/20/25 weighting was set manually
through observation, not validated against real outcomes.

**Milestone 3 plan:** Once sufficient real swipe/application data
exists, train a model (e.g., logistic regression or gradient-boosted
model) to learn which factors actually predict a successful
application/hire, replacing fixed weights with data-driven ones.

### 2.4 Rule-Based Swipe Signal → Collaborative/Behavioral Modeling
**Current limitation:** Swipe history only checks skill overlap
between a new job and the user's own past swipes — it doesn't learn
from patterns across *all* users.

**Milestone 3 plan:** Introduce collaborative filtering or
behavioral embeddings, so the model can learn patterns like "users
who liked jobs A and B also tend to like job C," even without direct
skill overlap.

### 2.5 Mocked Data → Live Integrations
**Current limitation:** Swipe history and job freshness/competition
data are currently mocked, pending Intern 2's and Intern 3's live
APIs.

**Milestone 3 plan:** Fully swap to live data sources (already
designed as a drop-in replacement, requiring no changes to scoring
logic — only the data-fetching functions change).

---

## 3. Summary Table

| Aspect | Milestone 2 (Now) | Milestone 3 (Planned) |
|---|---|---|
| Skill matching | Substring text match | Semantic/NLP-based similarity |
| Input | Manually typed skills | Full resume/ATS-parsed data |
| Weights | Fixed, manually tuned | Learned from real outcome data |
| Swipe signal | Per-user skill overlap only | Cross-user behavioral/collaborative patterns |
| Data sources | Mocked (Excel-based) | Live APIs from Intern 2 & Intern 3 |

---

## 4. Scope Confirmation

This heuristic version is intentionally simple by design for
Milestone 2, to allow the swipe feed to be demonstrated end-to-end.
No part of the current implementation is a trained AI/ML model, and
this document confirms that boundary clearly ahead of Milestone 3
planning.
