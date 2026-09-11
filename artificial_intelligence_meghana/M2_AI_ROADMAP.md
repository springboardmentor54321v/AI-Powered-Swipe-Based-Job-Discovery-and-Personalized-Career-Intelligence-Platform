# Milestone 2 AI/ML Roadmap — SwipeX Career Intelligence

This document details the transition plan from the **Milestone 1 Heuristic Baseline (`heuristic-v0`)** to advanced **AI/ML models** in **Milestone 2**.

> [!IMPORTANT]
> **Scope Notice**: This document is a strategic plan for Milestone 2. Milestone 1 remains 100% rule-based and heuristic. No trained machine learning models, embeddings, or neural networks are deployed in Milestone 1.

---

## 1. Milestone 1 Baseline Summary

In Milestone 1, Intern 3 implemented a deterministic rule-based scoring engine:
- **Resume Skill Extraction**: Extracted technical keywords from PDF resumes using regex matching against a controlled skill vocabulary.
- **Heuristic ATS Scoring**: Calculated match score using exact required skill overlap:
  $$\text{Match Score} = \frac{\text{Matched Required Skills}}{\text{Total Job Required Skills}} \times 100$$
- **Rule-Based Recommendations**: Ranked jobs from `data/jobs.csv` by skill overlap percentage descending.
- **Contract Tag**: Every response tagged with `"generated_by": "heuristic-v0"`.

---

## 2. Data Requirements for Milestone 2

To transition to statistical ML and NLP, Milestone 2 requires expanding the data foundation:

| Data Type | Description & Fields Needed | Purpose |
| :--- | :--- | :--- |
| **Resumes Dataset** | Raw text, parsed sections (Work Experience, Education, Skills, Projects, Certifications), seniority levels. | Training entity extractors & vector representations. |
| **Job Postings** | Title, detailed description, required & preferred skills, industry, experience range, location. | Building job embedding space & requirement models. |
| **User Interaction Data** | Candidate swipes (right/left), job views, bookmarking, application submissions. | Implicit feedback for collaborative filtering & learning-to-rank. |
| **Outcome Labels** | Interview calls, shortlisting, job offers, hiring decisions. | Supervised target labels for ranking models. |

---

## 3. Potential NLP / ML Pipeline Architecture

```
[ PDF Resume ] ──> [ Text Preprocessing ] ──> [ NLP Skill / Entity Extraction (NER) ]
                                                            │
                                                            ▼
[ Job Postings ] ──> [ Dense Text Embedding ] ──> [ Dual-Encoder Semantic Matching ]
                                                            │
                                                            ▼
[ Interaction History ] ──> [ Learning-to-Rank ] ──> [ Ranked Recommendations ]
```

1. **Preprocessing & Segmentation**: Clean resume text, tokenize, and segment into logical sections (Header, Experience, Skills, Education).
2. **Named Entity Recognition (NER)**: Fine-tuned spaCy transformer or BERT-based NER model to identify custom skills, job titles, institutions, and years of experience.
3. **Text Representation & Dense Embeddings**: Sentence-Transformers (e.g. `all-MiniLM-L6-v2` or `bge-small-en-v1.5`) to embed resumes and job descriptions into a shared 384-dimensional vector space.
4. **Semantic Similarity & Matching**: Compute cosine similarity between candidate embeddings and job embeddings, capturing semantic equivalence (e.g., matching "PyTorch" with "Deep Learning Frameworks").
5. **Hybrid Ranking & Recommendation**: Combine content-based semantic matching with collaborative filtering (Two-Tower Neural Architecture or LightGBM Ranker).
6. **Evaluation & Feedback Loop**: Continuous monitoring of recommendation quality and offline metric tracking.

---

## 4. Proposed Model Approaches for Milestone 2

### 4.1 Skill & Entity Extraction
- **Approach**: Fine-tuned Transformer NER model (RoBERTa-TokenClassification) or LLM structured extraction (JSON mode).
- **Benefit**: Detects unlisted skills, synonym variants (e.g., "React.js" = "React"), and contextual experience length.

### 4.2 Semantic ATS Matcher
- **Approach**: Dual-Encoder architecture (Bi-Encoder for retrieval + Cross-Encoder for high-accuracy reranking).
- **Benefit**: Understands semantic context beyond exact string matching (e.g., candidate with "PostgreSQL" matches a job requiring "Relational Databases").

### 4.3 Swipe-Driven Learning-to-Rank (L2R)
- **Approach**: LambdaMART / LightGBM Ranker trained on implicit candidate swipe signals.
- **Benefit**: Personalizes job feed dynamically based on user preferences and swipe patterns.

---

## 5. Training & Evaluation Plan

### 5.1 Dataset Split & Targets
- **Target Label**: Binary swipe right ($y=1$) vs. swipe left ($y=0$), or ordinal engagement score (Implicit view = 1, Swipe Right = 2, Apply = 3).
- **Split**: 70% Train, 15% Validation, 15% Test (temporal splitting to prevent data leakage across time).

### 5.2 Evaluation Metrics
- **Offline Retrieval & Ranking Metrics**:
  - **NDCG@10** (Normalized Discounted Cumulative Gain at rank 10).
  - **Recall@K** & **Precision@K** ($K = 5, 10, 20$).
  - **MRR** (Mean Reciprocal Rank).
- **Baseline Benchmark**: All ML models must statistically outperform the `heuristic-v0` baseline on the test benchmark dataset before deployment.

---

## 6. Data Limitations & Risks

1. **Small Dataset Size**: Current dataset (`jobs.csv`) contains 200 records. ML models require thousands of samples to generalize well.
2. **Cold-Start Problem**: New users or newly posted jobs lack interaction history for collaborative filtering.
3. **Data Quality & Resume Variance**: Diverse PDF layouts, multi-column designs, and scanned images can degrade text extraction.
4. **Algorithmic Bias & Fairness**: ML models risk inheriting bias present in historical hiring data. Regular fairness audits and debiasing constraints will be required.

---

## 7. Milestone 2 Migration Strategy

1. **API Contract Preservation**:
   - Retain the exact API paths (`/api/v1/resume/upload`, `/ats-score`, `/recommendations`).
   - Consumers (Frontend / Gateway) will experience zero breaking changes.

2. **Shadow Scoring & AB Testing**:
   - Run ML model in shadow mode alongside `heuristic-v0`.
   - Update `generated_by` field to `"ml-v1-sentence-transformer"` to indicate active model version.

3. **Gradual Rollout**:
   - Switch traffic to `ml-v1` only after passing offline evaluation benchmarks and verification tests.
