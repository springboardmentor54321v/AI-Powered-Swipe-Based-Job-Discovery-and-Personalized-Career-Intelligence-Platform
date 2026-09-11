# Milestone 2 Scope Document — SwipeX Career Intelligence

## Executive Summary

This document formalizes the exact scope boundaries for **SwipeX Milestone 2 — Intern 4 (AI/ML Career Intelligence & Matching Engine)**.

---

## 1. Milestone 2 Scope Definition

> [!IMPORTANT]
> **MILESTONE 2 MATCHING ENGINE = HEURISTIC PERSONALIZATION ONLY**

The Milestone 2 Matching Engine implementation is **100% deterministic, explainable, and rule-based**.

### Included in Milestone 2:
- ✅ **Rule-based multi-factor scoring formula** (bounded between $0$ and $100$).
- ✅ **Skill overlap calculation** (exact keyword matching against candidate PDF resume skills).
- ✅ **Location & remote preference matching** (city match vs remote policy points).
- ✅ **Experience level alignment** (matching years of candidate experience against job required ranges).
- ✅ **Job type preference matching** (`Full-time` vs `Internship`).
- ✅ **Freshness & competition heuristic bonuses** (recency index + startup bonus).
- ✅ **Swipe-based preference learning** (real-time weight adjustments from `RIGHT`/`APPLY`/`SAVE` vs `LEFT`/`SKIP` actions).
- ✅ **Explainable human-readable reason tags** (`"Matches your skills"`, `"Remote job"`, `"Based on your swipe history"`).
- ✅ **API Endpoints**: `POST /api/v1/swipes`, `POST /api/v1/user/profile`, `GET /api/v1/recommendations`.

---

## 2. Explicitly Out of Scope for Milestone 2

The following AI/ML capabilities are **NOT included** in Milestone 2 and are strictly deferred to **Milestone 3**:

- ❌ **No trained machine learning recommendation models** (e.g. Random Forest, XGBoost, LightGBM, Gradient Boosted Decision Trees).
- ❌ **No machine learning model training pipelines**.
- ❌ **No deep learning or neural network architectures** (e.g. PyTorch, TensorFlow, Two-Tower Networks).
- ❌ **No LLM-based ranking or LLM fine-tuning**.
- ❌ **No dense vector embeddings or vector databases** (e.g. Sentence-Transformers, FAISS, Pinecone).
- ❌ **No learned parameters or weights optimization**.

---

## 3. Milestone 3 Scope Boundary

Full machine learning recommendation, learning-to-rank, dense semantic embeddings, and advanced ATS-aware ranking will be implemented in **Milestone 3**, building upon the data interaction baseline established in Milestone 2.
