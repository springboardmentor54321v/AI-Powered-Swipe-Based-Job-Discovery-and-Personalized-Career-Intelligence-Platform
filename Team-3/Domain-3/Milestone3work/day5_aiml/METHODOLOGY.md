# Day 5 AI/ML Methodology Documentation
**Domain 4 / Intern 4 — AI/ML Career Intelligence**
**Project:** SwipeX — Milestone 3

---

## 1. Overview
This document outlines the scoring, suggestion generation, and recommendation methodology implemented in Day 5 of Milestone 3.

---

## 2. Resume Optimization Suggestions Module
The suggestions engine evaluates candidate resumes against job requirements to provide actionable improvement tips.

### Formula & Logic:
1. **Keyword Match Percentage**:
   $$\text{Match \%} = \left( \frac{|\text{Extracted Resume Skills} \cap \text{Job Required Skills}|}{|\text{Job Required Skills}|} \right) \times 100$$

2. **Missing Skills Detection**:
   $$\text{Missing Skills} = \text{Job Required Skills} \setminus \text{Extracted Resume Skills}$$

3. **Recommendation Categories**:
   * **Low Match (< 50%)**: Directs candidate to highlight core technical skills and projects.
   * **Moderate Match (50% - 79%)**: Advises candidate to quantify accomplishments.
   * **High Match ($\ge 80\%$)**: Recommends placing key skills prominently in summary section.

---

## 3. Upgraded Recommendation Engine Methodology
The recommendation engine blends vector semantic similarity with user swipe interaction heuristics fetched from Intern 2's API Gateway.

### Blended Scoring Formula:
$$\text{Final Match Score} = \min\left(1.0, \, \text{Semantic Score} + \text{Swipe Boost}\right)$$

### Heuristic Rules:
1. **Swipe Right (Liked Job)**:
   * Adds a **+20% boost** ($\text{Swipe Boost} = +0.20$) to the candidate job's score.
2. **Swipe Left (Disliked Job)**:
   * **Hard Filter**: Completely excludes the job from candidate recommendation lists.

---

## 4. API Integration & Handoff Specs
* **Provided To Intern 1 (Frontend)**: Structured JSON output containing `keyword_match_pct`, `missing_skills`, and top suggestions array for UI display.
* **Provided To Intern 2 (Backend/Gateway)**: Exposed `get_recommendations()` function consuming `/api/v1/swipes/history` and `/api/v1/jobs` endpoints.
