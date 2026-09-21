# MILESTONE 3: AI/NLP Design and ATS Scoring Architecture

## 1. Selected AI / NLP Tools
The following free and open-source tools have been finalized for the AI/NLP stack in Milestone 3, prioritizing local processing and maintaining zero reliance on paid external APIs:

- **PDF Text Extraction**: `pdfplumber` (Reliable rendering and bounding-box based text layout extraction for PDF resumes)
- **DOCX Text Extraction**: `python-docx` (Directly interfaces with Microsoft Word XML definitions for precise text extraction)
- **Skill / Entity Extraction**: `spaCy` (Industrial-grade NLP library used via rule-based matching with a curated skills list to ensure domain-specific technical terms are found)
- **Curated Skills Dictionary**: A project-local curated skills dictionary matching common technical skill sets to standardize extractions.
- **Future Semantic Embeddings**: `sentence-transformers` (To be used in Day 4 for converting skills and job requirements into dense vector embeddings for semantic matching)
- **Future Vector Database**: `ChromaDB` (To be used in Day 4 for storing and searching job requirement vectors locally)
- **Future AI Suggestions**: Optional LLM layer with a completely free rule-based/template fallback (To be implemented later).

## 2. Extraction Flows

### 2.1. Resume Extraction Flow
1. **Input**: A resume (PDF or DOCX).
2. **Detection**: Identify format (PDF vs DOCX).
3. **Extraction**: Utilize the appropriate library (`pdfplumber` or `python-docx`) to parse text.
4. **Cleaning**: Normalize whitespace, trim trailing/leading spaces.
5. **Output**: Raw, clean, plain text.

### 2.2. Skill Extraction Flow
1. **Input**: Clean plain text from the resume extraction flow.
2. **Processing**: Use `spaCy` NLP pipeline with a custom matcher/PhraseMatcher.
3. **Matching**: Compare tokens and phrases in the text against the project's curated technical skills dictionary.
4. **Post-processing**: Normalize casing (e.g. all lowercase or canonical casing) and deduplicate the list.
5. **Output**: Array of deterministic, identified skills perfectly suited for storage in `ResumeSkill` schema.

## 3. ATS Scoring Architecture (Blended Approach)

The future Applicant Tracking System (ATS) scoring engine (to be implemented on Days 3 and 4) will rely on a configurable blended formula evaluating both deterministic keyword matches and implicit semantic similarity. 

### 3.1. Keyword Score 
- **Method**: Exact and case-insensitive matching between resume-extracted skills and job-required skills.
- **Purpose**: To guarantee credit is given when a candidate has precisely the technology requested (e.g. exact match on 'Python' or 'Kubernetes').
- **Calculation**: \`(Matched Keywords / Total Job Required Keywords) * 100\`

### 3.2. Semantic Score (Day 4)
- **Method**: Using `sentence-transformers` to embed both job descriptions/skills and resume skills, and computing cosine similarity (via `ChromaDB`).
- **Purpose**: To credit candidates for conceptually related skills even if keywords don't precisely match (e.g., 'Scikit-learn' is closely related to 'Machine Learning', or 'GCP' is related to 'AWS').
- **Missing Skill Detection**: Identify required job skills that lack both exact and close semantic matches from the candidate.

### 3.3. Final Blended Score
- The final score will be a configurable weighted average:
  > **ATS Score = (Weight_Keyword * Keyword Score) + (Weight_Semantic * Semantic Score)**
- Weights will not be hardcoded as magic numbers, but instead placed in the configuration so they can be tuned.

## 4. Sub-Component Output Contracts
- **Missing Skills**: The system will provide a deterministic list of skills required by the job that are absent in both exact matches and semantic thresholds.
- **Future Integration**: The scores and missing skills will be served by Intern 4's endpoint to Intern 2's API Gateway integration (Day 7).

---
*Document produced as part of Day 1 AI/NLP Stack Finalization and Architecture Planning.*
