# SwipeX Matching Engine — Technical Specification (Milestone 2)

## 1. Overview & Architecture

The **SwipeX Matching Engine** (Intern 4 — AI/ML Career Intelligence) evaluates candidate-to-job compatibility for the SwipeX platform. In **Milestone 2**, recommendations are computed using a deterministic, explainable, rule-based heuristic scoring engine without machine learning models, deep neural networks, or LLM embeddings.

The engine processes job posting data from `data/jobs.csv`, candidate profiles/skills extracted from PDF resumes (`src/parser.py`, `src/skills.py`), user preference profiles, and user swipe history (`RIGHT`/`APPLY`/`SAVE` vs `LEFT`/`SKIP`).

---

## 2. Heuristic Scoring Formula

The total match score for a job $J$ relative to candidate $U$ is a composite score bounded between $0$ and $100$:

$$\text{Match Score} = \min\left(100, \max\left(0, \text{round}(S_{\text{skills}} + S_{\text{location}} + S_{\text{experience}} + S_{\text{job\_type}} + S_{\text{freshness}} + S_{\text{swipe\_adj}})\right)\right)$$

### 2.1 Factors and Weights Breakdown

| Factor | Weight / Max Points | Description & Calculation Rules |
| :--- | :--- | :--- |
| **1. Skill Match ($S_{\text{skills}}$)** | **45 Points** | Proportion of required job skills matched by candidate skills.<br>$$S_{\text{skills}} = \left( \frac{|\text{Candidate Skills} \cap \text{Job Required Skills}|}{|\text{Job Required Skills}|} \right) \times 45$$<br>*(If job has no required skills, $S_{\text{skills}} = 45$ points)* |
| **2. Location & Remote ($S_{\text{location}}$)** | **20 Points** | - Candidate location matches Job location: **+20 points**<br>- Candidate prefers Remote & Job is Remote (`Remote == "Yes"` or `Location == "Remote"`): **+20 points**<br>- Job is Remote (even if unspecified candidate location): **+15 points**<br>- Otherwise: **0 points** |
| **3. Experience Level ($S_{\text{experience}}$)** | **15 Points** | Matches candidate experience level against job required range (`0-1 years`, `0-2 years`, `1-3 years`, `2-4 years`).<br>- Exact level match: **+15 points**<br>- Within +1 year allowance: **+10 points**<br>- Baseline/Unspecified: **+5 points** |
| **4. Job Type ($S_{\text{job\_type}}$)** | **10 Points** | Matches preferred job type (`Full-time` vs `Internship`).<br>- Exact job type match: **+10 points**<br>- Unspecified candidate preference: **+5 points** |
| **5. Freshness & Competition ($S_{\text{freshness}}$)** | **10 Points** | - Recency bonus (Jobs listed earlier in dataset, e.g. index 0–50): **+5 points**<br>- Low competition / Startup bonus (`Company Type == "Startup"`): **+5 points** |
| **6. Swipe Preference ($S_{\text{swipe\_adj}}$)** | **$\pm 15$ Points** | Dynamic score adjustment computed from candidate's historical swipe actions (`RIGHT`/`APPLY`/`SAVE` vs `LEFT`/`SKIP`). |

---

## 3. Swipe-Based Preference Learning Mechanics

The Matching Engine learns user preferences dynamically through simple weight adjustment without machine learning model re-training.

### 3.1 Preference Vector Construction
For each user $U$, the system maintains cumulative preference counters for skills, locations, job types, and remote preferences:

- **Positive Swipes (`RIGHT`, `APPLY`, `SAVE`)**:
  - Increments candidate's preference count for each skill present in the swiped job by **+1**.
  - Increments candidate's preference for the job's location by **+1**.
  - Increments candidate's preference for the job's job type by **+1**.
  - If job is remote, increments remote preference by **+1**.

- **Negative Swipes (`LEFT`, `SKIP`)**:
  - Decrements candidate's preference count for each skill present in the swiped job by **-1**.
  - Decrements candidate's preference for the job's location by **-1**.
  - Decrements candidate's preference for the job's job type by **-1**.
  - If job is remote, decrements remote preference by **-1**.

### 3.2 Swipe Score Adjustment ($S_{\text{swipe\_adj}}$)
For a candidate $U$ evaluating job $J$:

$$S_{\text{swipe\_adj}} = \sum_{s \in \text{Job Skills}} 3 \times \text{clamp}(\text{Pref}_{\text{skill}}(s), -2, 2) + 4 \times \text{clamp}(\text{Pref}_{\text{loc}}(\text{Job Loc}), -2, 2) + 3 \times \text{clamp}(\text{Pref}_{\text{type}}(\text{Job Type}), -2, 2)$$

Bounded to a maximum range of **$-15 \le S_{\text{swipe\_adj}} \le +15$**.

---

## 4. Handling Missing & Empty Fields

To ensure robustness, missing or empty fields are handled explicitly:

| Missing Field | Fallback / Handling Rule |
| :--- | :--- |
| **Candidate Resume / Skills** | Default to empty skill set ($0$ skill match points). |
| **Candidate Location** | Default to location neutral; Remote jobs receive standard $+15$ points. |
| **Candidate Experience** | Assumed entry-level (`0-1 years`); matches entry-level jobs with full $+15$ points. |
| **Job Required Skills** | Treated as requiring no specific skills; returns full $45$ skill match points. |
| **Job Location / Remote** | Non-remote local job fallback ($0$ remote points if missing). |
| **Swipe History** | Neutral preference adjustment ($S_{\text{swipe\_adj}} = 0$). |

---

## 5. Human-Readable Reason Tags

Recommendations include human-readable reason tags to provide clear, explainable feedback on why a job was recommended. A reason tag is included **only if the corresponding condition actually contributed points to the match score**:

1. **`"Matches your skills"`**: Triggered if candidate matches $\ge 2$ required skills or skill match ratio $\ge 50\%$.
2. **`"Matches your preferred location"`**: Triggered if candidate location matches job location.
3. **`"Remote job"`**: Triggered if job allows remote work (`Remote == "Yes"` or `Location == "Remote"`).
4. **`"Low competition"`**: Triggered if job is from a Startup company or low-competition pool.
5. **`"Recently posted"`**: Triggered if job is among the top 25% most recent postings in `jobs.csv`.
6. **`"Matches your experience"`**: Triggered if job required experience matches candidate experience.
7. **`"Based on your swipe history"`**: Triggered if swipe history adjustment ($S_{\text{swipe\_adj}}$) contributed $+3$ or more points.

---

## 6. Verification & SRS Compliance

This specification satisfies all Milestone 2 SRS requirements:
- **Deterministic & Explainable**: Formula is transparent and fully audit-traceable.
- **No Model Training**: Operates without weights fine-tuning or vector databases.
- **Dynamic Updates**: Swipes directly alter ranking and reasons in real time.
