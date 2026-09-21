# MILESTONE 3: KNOWN LIMITATIONS

This document outlines the valid technical and systemic limitations of the SwipeX Intern 4 AI/ML Services integration as of the end of Milestone 3.

## 1. Resume Parsing & Extraction
- **PDF Formatting Limits**: Highly customized visual resumes with dense multi-column layouts, charts, or images may fail to parse cleanly via `pdfplumber`, leading to broken text representations.
- **Skill Dictionary Coverage**: The rule-based deterministic skill extraction engine (`extract_skills`) is limited by its internal hardcoded technical word dictionary. Highly novel, misspelled, or ultra-niche software terminology escapes detection.

## 2. ATS Scoring Engine
- **Sparse Job Keywords**: The ATS matching accuracy degrades if jobs provided in `jobs.csv` lack robust `Required Skills` metadata, resulting in inflated (100%) scores for mostly hollow job posts.
- **Strict Keyword Matching**: Non-semantic exact matching occasionally misses synonymous technologies (e.g., "Postgres" vs "PostgreSQL") unless explicitly hardcoded into parsing exceptions, though the Semantic layer mitigates this partially.

## 3. AI Resume Optimization Suggestions
- **Heuristic API Constraints**: Due to the Milestone 3 constraints removing external paid LLM calls, the suggestion generator falls back purely to deterministic template generation based on ATS scores. Uniquely contextual formatting advice is inaccessible.

## 4. Semantic Similarity (ChromaDB)
- **Local Embedded Constraints**: Utilizing `all-MiniLM-L6-v2` locally via `sentence-transformers` is relatively slow compared to hosted model APIs and memory-bound during initial vector generation.
- **Sparse Resume Data**: Candidates who upload sparse one-line resumes yield poor vector quality, diluting the effectiveness of semantic cosine similarity comparisons.

## 5. Systemic Checks
- **Small Evaluation Dataset**: Hand-labeled accuracy analysis exists purely on a micro spot-check basis to verify internal engine boundaries, meaning large-scale statistical validation of recommendation success metrics has not yet occurred.
