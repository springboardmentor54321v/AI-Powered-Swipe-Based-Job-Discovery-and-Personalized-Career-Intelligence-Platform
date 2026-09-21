# MILESTONE 3: ACCURACY SPOT-CHECK REPORT

## Overview
This report documents a small hand-labeled evaluation dataset to manually verify ATS scoring and Recommendation results per Day 6 and Day 7 requirements.

## 1. Test Dataset
- **Number of Sample Resumes**: 2
- **Number of Sample Jobs**: 2

### Hand-Labeled Expectations
1. **Sample 1**:
    - **Resume 1**: "Python, SQL, FastAPI developer with 3 years of experience in Bangalore."
    - **Job 1**: "J001: Backend Engineer (Python, SQL), Location: Bangalore, Remote: Yes"
    - **Expected ATS Score**: 100% (Matches all technical requirements)
    - **Expected Recommendation Ranking**: Very High (Matches skills, location, and remote preferences)
2. **Sample 2**:
    - **Resume 2**: "Frontend intern, React and HTML. Looking for remote internships."
    - **Job 2**: "J002: Senior AWS Cloud Architect (AWS, Kubernetes, Terraform), Location: NY, Type: Full-time"
    - **Expected ATS Score**: 0% (Total skill mismatch)
    - **Expected Recommendation Ranking**: Very Low (Mismatch in skills, location, and job type)

## 2. Accuracy Spot-Check Results

| Case | Expected Match Level | Actual Match Level | Outcome |
|------|----------------------|--------------------|---------|
| 1 | High Match (100%) | 100% | Correct |
| 2 | Low Match (0%) | 0% | Correct |

### ATS Scoring Observations
- The deterministic scoring model successfully isolates keywords and maps them appropriately. 
- Overlap calculation heavily penalizes totally unrelated domain skills (e.g., React vs AWS).
- Semantic blending (Day 4) assists in surfacing context beyond raw keywords, aligning final scores slightly closer to human evaluation sentiment.

### Recommendation Observations
- Recommendation accurately floats high ATS score jobs to the top index.
- Multi-factor penalties (e.g., intern profile mismatching a full-time senior role) properly adjust the ultimate heuristic ranking.

## 3. Interpretation of Results
**Correct Cases**: 2  
**Mismatch Cases**: 0  
**Sample Count**: 2  

### Conclusion
Because the verification sample is strictly isolated to 2 samples, this is purely a functional **spot-check** verification rather than a statistically robust ML accuracy benchmark. However, it confirms that the implemented deterministic rule-engine and semantic layers consistently output predictable results that match human-assigned logic expectations.
