# Milestone 3 AI/ML Recommendation Engine Roadmap — SwipeX Career Intelligence

This document outlines the strategic transition from the **Milestone 2 Heuristic Matching Engine (`heuristic-v0`)** to a fully trained **AI/ML Recommendation & Ranking Model** in **Milestone 3**.

> [!IMPORTANT]
> **Scope Notice**: Milestone 2 relies strictly on deterministic, rule-based heuristics and swipe-history weight adjustments. **No machine learning models, neural networks, or vector embeddings are trained or executed in Milestone 2.** This document defines the engineering plan for Milestone 3 implementation.

---

## 1. Current Milestone 2 Heuristic Approach

In Milestone 2 (Intern 4), candidate job discovery uses a deterministic, explainable heuristic engine:

- **6-Factor Heuristic Formula** (Bounded 0–100):
  $$\text{Match Score} = \min\left(100, \max\left(0, \text{round}(S_{\text{skills}} + S_{\text{location}} + S_{\text{experience}} + S_{\text{job\_type}} + S_{\text{freshness}} + S_{\text{swipe\_adj}})\right)\right)$$
- **Skill Overlap ($S_{\text{skills}}$, Max 45 pts)**: Candidate skill match ratio computed via exact keyword parsing against `Required Skills`.
- **Location & Remote Fit ($S_{\text{location}}$, Max 20 pts)**: Exact city match or remote preference alignment.
- **Experience Alignment ($S_{\text{experience}}$, Max 15 pts)**: Candidate experience years matched against job requirement ranges (`0-1`, `1-3`, `2-4` years).
- **Job Type Preference ($S_{\text{job\_type}}$, Max 10 pts)**: Matching preferred engagement model (`Full-time` vs `Internship`).
- **Freshness & Competition ($S_{\text{freshness}}$, Max 10 pts)**: Recency index (<25th percentile in job pool) and startup bonus.
- **Swipe-Based Preference Adjustment ($S_{\text{swipe\_adj}}$, $-15 \le S_{\text{swipe\_adj}} \le +15$)**: Cumulative score shifts based on historical user interactions (`RIGHT`/`APPLY`/`SAVE` vs `LEFT`/`SKIP`).
- **Explainable Reason Tags**: Dynamic generation of tags (`"Matches your skills"`, `"Remote job"`, `"Based on your swipe history"`, etc.) based on actual point contributions.

---

## 2. Current Limitations of Heuristic Scoring

While deterministic and transparent, the Milestone 2 approach has key architectural limitations:

1. **Manually Defined Weights**: Weights ($45, 20, 15, 10, 10$) and swipe step sizes ($+3, -3$) are engineered manually rather than learned from candidate behaviour.
2. **Coarse Keyword Skill Matching**: Exact string matching fails to capture semantic equivalence (e.g. `PostgreSQL` vs `SQL`, `React.js` vs `Frontend`).
3. **Linear & Uncoupled Factors**: Multiplicative cross-feature interactions (e.g. high skill fit + junior candidate for senior role) are hard-coded with simplistic rules.
4. **No Learned Parameters**: The system cannot automatically adapt to changing market trends or user conversion patterns (e.g., job applications resulting in interviews).
5. **Cold-Start Sensitivity**: New jobs or sparse user profiles rely heavily on baseline defaults.

---

## 3. Milestone 3 AI/ML Strategic Direction

Milestone 3 will replace the static heuristic weights with a data-driven **Learning-to-Rank (L2R) / Collaborative-Filtering ML Architecture**:

```
[ User Profile & Resumes ] ──┐
                             ├─► [ Feature Extraction ] ──► [ Machine Learning ] ──► [ Ranked Feed & ]
[ Historical Swipes & App ] ──┤   & Dense Embeddings         Ranking Model          Match Scores
                             │                               (LightGBM / Two-Tower)
[ Job Postings Pool ] ───────┘
```

### 3.1 Data Collection & Implicit Feedback Loop
- **Target Label Definition**:
  - `0` = Implicit Skip / Dismiss
  - `1` = `LEFT` Swipe (Dislike)
  - `2` = `RIGHT` Swipe (Like)
  - `3` = `SAVE` / Bookmark
  - `4` = `APPLY` Submission (Strongest Positive Signal)
- **Interaction Data Storage**: Transition from in-memory dictionary stores (`SWIPE_STORE`) to a persistent database table (`user_job_interactions`) tracking user ID, job ID, action, timestamp, and context (candidate profile state at time of swipe).

### 3.2 Machine Learning Model Selection
- **Primary Architecture Options**:
  1. **Gradient Boosted Decision Trees (GBDT / LightGBM Ranker)**:
     - Formulated as a Learning-to-Rank problem (`LambdaMART`).
     - Excellent performance on tabular feature sets (skills match %, location distance, experience delta, swipe counts).
     - Lightweight, fast inference (<10ms per batch), easy to interpret feature importances.
  2. **Two-Tower Neural Recommendation Architecture**:
     - Candidate Tower: Encodes candidate skills, profile vectors, and swipe history embeddings.
     - Job Tower: Encodes job title, description embeddings, required skills, and metadata.
     - Dot-product similarity layer for real-time dense retrieval & ranking.

### 3.3 Offline vs Online Evaluation Framework
- **Baseline Comparison**: The trained ML model must be continuously benchmarked against the `heuristic-v0` baseline using offline evaluation:
  - **NDCG@10** (Normalized Discounted Cumulative Gain at Top 10 recommendations)
  - **Recall@K** ($K = 5, 10, 20$)
  - **MRR** (Mean Reciprocal Rank of first `APPLY` action)
- **A/B Testing Deployment**: Shadow deployment mode where requests receive `heuristic-v0` responses while logging predictions from `ml-v1` for model monitoring.

---

## 4. Milestone 3 AI/ML Component Breakdown

| Component | Technology / Approach | Milestone 3 Purpose |
| :--- | :--- | :--- |
| **Dense Skill & Job Embeddings** | Sentence-Transformers (`all-MiniLM-L6-v2` or `bge-small-en-v1.5`) | Capture semantic proximity between candidate skills/experience and job descriptions beyond exact keyword matches. |
| **Feature Engineering Pipeline** | `scikit-learn` / `pandas` / `numpy` | Extract numerical, categorical, and interaction features (e.g. skill overlap ratio, location distance, salary fit, historical user swipe rates). |
| **Learning-to-Rank Model** | `LightGBM` / `XGBoost` (`rank:pairwise` or `rank:ndcg`) | Learn optimal feature weights directly from historical swipe and application outcomes. |
| **ATS-Aware Reranker** | Fine-tuned Transformer Cross-Encoder | Provide granular section-level resume parsing alignment for high-confidence candidate applications. |
| **Personalization Layer** | Matrix Factorization / Collaborative Filtering | Recommend jobs liked by candidates with similar skill profiles and swipe patterns. |
| **Explainable ML (SHAP)** | `shap` TreeExplainer | Translate GBDT feature importances back into human-readable reason tags to maintain explainability contract. |

---

## 5. Milestone 3 Implementation Roadmap Summary

1. **Phase 1 — Data Collection**: Instrument interaction logger and export historical swipe dataset.
2. **Phase 2 — Feature Engineering**: Build candidate feature vectors and job metadata vectors.
3. **Phase 3 — Model Training**: Train GBDT LightGBM Ranker on offline interaction dataset.
4. **Phase 4 — Offline Evaluation**: Validate NDCG@10 superiority over `heuristic-v0`.
5. **Phase 5 — Hybrid Integration**: Update `src/recommender.py` to support fallback/hybrid execution (`heuristic-v0` fallback + `ml-v1` inference).
6. **Phase 6 — API Contract Update**: Expose `generated_by: "ml-v1-lightgbm"` in HTTP response payload while keeping schema backward compatible.
