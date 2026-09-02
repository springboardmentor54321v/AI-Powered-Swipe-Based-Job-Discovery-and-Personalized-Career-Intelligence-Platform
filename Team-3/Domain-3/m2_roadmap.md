# Milestone 2 Roadmap — Real AI/ML Upgrade Plan

## Current Limitation (Milestone 1)
- Skill matching is exact-text only (e.g. "ML" ≠ "Machine Learning", "React" ≠ "React.Js")
- No understanding of skill relationships or meaning
- Fixed skill list (KNOWN_SKILLS) instead of dynamic extraction
- Recommendation loops through all jobs every request — not scalable
- Resume data stored temporarily in memory, lost on server restart

## Planned Improvements for Milestone 2

1. **Semantic skill matching** — use sentence-transformers to understand 
   meaning, so "ML" and "Machine Learning" are correctly matched, even with 
   different wording.

2. **Smarter skill extraction** — use spaCy's NLP capabilities to extract 
   skills directly from raw resume/job text, instead of relying on a fixed 
   manually-written list.

3. **Weighted scoring** — not all skills should count equally; core 
   required skills should weigh more than nice-to-have ones.

4. **Faster recommendations** — replace the full-dataset loop with vector 
   search / embeddings using a vector database (as shown in our architecture 
   diagram), so recommendations scale