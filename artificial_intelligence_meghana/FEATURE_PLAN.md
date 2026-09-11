# SwipeX ATS Feature Plan

## Overview
This document outlines the heuristic matching workflow between Resumes and Job Descriptions for the SwipeX Job Discovery platform. 

**Note: Milestone 1 Scope**
The current Milestone 1 uses **ONLY heuristic/rule-based logic**. 
There will be NO machine learning models trained, NO deep learning, and NO embeddings used at this stage. Real NLP/ML model development is strictly reserved for Milestone 2. 
For Milestone 1: Resume → text/skills/keywords → heuristic matching → ATS score.

## Features

### RESUME FEATURES
- **Extracted Skills**: Skill keywords extracted from candidate resume PDF (e.g., Python, SQL, Git, Machine Learning, Deep Learning, AWS, Docker, Java, React, Node.js).
- **Technical Keywords**: Domain terms present in extracted resume text.
- **Experience**: Parsed experience duration / years.
- **Education**: Extracted degree / academic background keywords.
- **Projects**: Extracted project terms.
- **Certifications**: Extracted certification tags.

### JOB DESCRIPTION FEATURES
- **Required Skills**: Parsed skills from dataset (`Required Skills` field e.g., Python, SQL, Git, PyTorch, Docker, etc.).
- **Technical Keywords**: Job description keyword phrases.
- **Experience Requirements**: Categorical experience levels (`0-1 years`, `0-2 years`, `1-3 years`, `2-4 years`).
- **Job Role**: Title categorization (`Job Title`).
- **Location & Remote**: Target location and remote availability flag.

### ATS MATCHING FEATURES (Day 4 Scope)
- **Skill Overlap Score**: Jaccard / count overlap of resume skills vs job required skills.
- **Keyword Overlap Score**: Count of matching domain keywords.
- **Experience Match**: Score indicating whether candidate experience satisfies required experience range.
- **Overall Match Percentage**: Weighted heuristic score combining skill overlap and keyword match.

### RECOMMENDATION FEATURES (Day 4 Scope)
- **Skill Overlap**: Ranking job postings by skill match count.
- **Keyword Overlap**: Ranking jobs by shared technical terms.
- **Match Percentage**: Overall suitability ranking.
