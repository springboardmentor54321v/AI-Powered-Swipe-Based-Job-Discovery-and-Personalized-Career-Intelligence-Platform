# SwipeX — Intern 3 EDA Report

## 1. Dataset Overview
- **Dataset Source**: Intern 2 Job Dataset (`data/jobs.csv`, relocated from `data/Jobtrain.csv`).
- **Total Records**: 200 job postings.
- **Total Columns**: 11 columns.
- **Available Fields**:
  1. `Job ID` (String: Unique identifier e.g., J001 to J200)
  2. `Job Title` (String: Role name e.g., Python Developer, Data Analyst)
  3. `Company` (String: Hiring organization e.g., Deloitte, TCS, Infosys)
  4. `Company Type` (String: Classification e.g., MNC, Startup)
  5. `Location` (String: Geographical city e.g., Bangalore, Pune, Remote)
  6. `Remote` (String: Remote employment status, "Yes" or "No")
  7. `Required Skills` (String: Python literal list of skills e.g., `['Python', 'Django', 'Flask']`)
  8. `Experience` (String: Experience range e.g., `0-1 years`, `1-3 years`)
  9. `Salary` (String: Salary range in LPA e.g., `3-5 LPA`, `8-12 LPA`)
  10. `Job Type` (String: Employment arrangement e.g., `Full-time`, `Internship`)
  11. `Job Description` (String: Free text describing job responsibility)

## 2. Data Quality
- **Missing Values**: 0 missing values across all 11 columns (100% complete data).
- **Duplicate Records**: 0 duplicate rows detected.
- **Data Consistency**:
  - `Required Skills` is consistently stored as string representation of lists (e.g., `"['Python', 'SQL', 'Excel']"`), requiring string evaluation / literal parsing to extract individual skill tokens.
  - `Salary` and `Experience` fields use standardized range string formats (`X-Y LPA`, `X-Y years`).

## 3. Job Role Analysis
- **Unique Job Roles**: 20 distinct job titles.
- **Title Distribution**: Exactly 10 job postings (5.0%) for each of the 20 job titles:
  1. Python Developer (10)
  2. Data Analyst (10)
  3. Data Scientist (10)
  4. Machine Learning Engineer (10)
  5. AI Engineer (10)
  6. Software Developer (10)
  7. Business Analyst (10)
  8. Cloud Engineer (10)
  9. Data Engineer (10)
  10. Java Developer (10)
  11. Frontend Developer (10)
  12. Backend Developer (10)
  13. Full Stack Developer (10)
  14. Product Analyst (10)
  15. NLP Engineer (10)
  16. Computer Vision Engineer (10)
  17. DevOps Engineer (10)
  18. Database Developer (10)
  19. Cybersecurity Analyst (10)
  20. AI Research Intern (10)
- **Observations**: The dataset is perfectly balanced across technical software, data, AI/ML, and cloud/security domains.

## 4. Company Analysis
- **Unique Companies**: 19 distinct hiring companies.
- **Company Type Breakdown**:
  - **MNC**: 170 postings (85.0%)
  - **Startup**: 30 postings (15.0%)
- **Top Companies**:
  - Deloitte: 20 postings (10.0%)
  - TCS: 10 postings (5.0%)
  - Infosys: 10 postings (5.0%)
  - Wipro: 10 postings (5.0%)
  - Accenture: 10 postings (5.0%)
  - Cognizant, HCLTech, Capgemini, Tech Mahindra, IBM (10 postings each).

## 5. Location and Remote Analysis
- **Unique Locations**: 10 distinct locations.
- **Location Distribution**: Exactly 20 postings (10.0%) per location:
  - Bangalore, Pune, Noida, Remote, Chennai, Delhi, Kochi, Hyderabad, Mumbai, Gurugram.
- **Remote Work Breakdown**:
  - **Non-Remote (`Remote = No`)**: 153 postings (76.5%)
  - **Remote (`Remote = Yes`)**: 47 postings (23.5%)

## 6. Job Type Analysis
- **Full-time**: 179 postings (89.5%)
- **Internship**: 21 postings (10.5%)

## 7. Experience Analysis
- **Unique Experience Categories**: 4 distinct experience requirement ranges.
- **Distribution**: Exactly 50 postings (25.0%) for each category:
  1. `0-1 years` (Entry Level / Fresher): 50 postings (25.0%)
  2. `0-2 years` (Junior Level): 50 postings (25.0%)
  3. `1-3 years` (Mid-Junior Level): 50 postings (25.0%)
  4. `2-4 years` (Mid Level): 50 postings (25.0%)
- **Observations**: The dataset targets early-career to mid-level professionals (0–4 years experience), perfectly aligning with internship and entry/junior job discovery.

## 8. Salary Analysis
- **Unique Salary Ranges**: 5 distinct LPA (Lakhs Per Annum) ranges.
- **Distribution**: Exactly 40 postings (20.0%) per salary range:
  1. `3-5 LPA`: 40 postings (20.0%)
  2. `4-6 LPA`: 40 postings (20.0%)
  3. `5-8 LPA`: 40 postings (20.0%)
  4. `6-10 LPA`: 40 postings (20.0%)
  5. `8-12 LPA`: 40 postings (20.0%)
- **Limitations**: Salary is represented as text range strings (e.g. `"3-5 LPA"`). For numerical comparisons or filtering, min/max numbers must be parsed from the string.

## 9. Required Skills Analysis
- **Total Skill Occurrences**: 1,000 skill tags across 200 jobs (average 5 skills per job posting).
- **Unique Skills**: 48 distinct skill keywords.
- **Top Required Skills**:
  1. **Python**: 130 postings (65.0% of all jobs require Python)
  2. **SQL**: 120 postings (60.0% of all jobs require SQL)
  3. **Git**: 80 postings (40.0%)
  4. **Machine Learning**: 60 postings (30.0%)
  5. **Deep Learning**: 60 postings (30.0%)
  6. **PyTorch**: 60 postings (30.0%)
  7. **AWS**: 40 postings (20.0%)
  8. **Docker**: 40 postings (20.0%)
  9. **Java**: 40 postings (20.0%)
  10. **React**: 40 postings (20.0%)
  11. **Node.js**: 40 postings (20.0%)
  12. **Excel**: 30 postings (15.0%)
  13. **Power BI**: 30 postings (15.0%)
  14. **TensorFlow**: 20 postings (10.0%)
  15. **Linux**: 20 postings (10.0%)
  16. **Tableau**: 10 postings (5.0%)
  17. **Pandas**: 10 postings (5.0%)
  18. **NumPy**: 10 postings (5.0%)
  19. **Scikit-learn**: 10 postings (5.0%)
  20. **Communication**: 10 postings (5.0%)
- **Skill Pattern Observations**:
  - Core programming languages (`Python`, `Java`, `SQL`, `JavaScript`/`React`/`Node.js`) and foundational tools (`Git`, `Docker`, `AWS`) are heavily emphasized.
  - Data Science & AI roles require `Python`, `SQL`, `Pandas`, `NumPy`, `Scikit-learn`, `PyTorch`, `TensorFlow`, and `Deep Learning`.

## 10. Job Description Analysis
- **Text Statistics**:
  - Character Length: Min = 124 chars, Max = 156 chars, Mean = 135.0 chars, Median = 132.0 chars.
  - Word Count: Min = 19 words, Max = 22 words, Mean = 19.6 words, Median = 19.0 words.
- **Characteristics**: Job descriptions are concise, structured template strings following the pattern: `"Work on [role] projects using [skill1], [skill2], [skill3]. Collaborate with teams to build, test and improve scalable solutions."`

## 11. Resume Sample Analysis
- **Directory**: `data/resumes/`
- **Status**: **PENDING / UNAVAILABLE**.
- **Observation**: Only `.gitkeep` was found in `data/resumes/`. No actual resume samples were provided in the dataset directory. Per project guidelines, no fake or synthetic resume files were generated. Resume parsing logic will be tested using a sample uploaded PDF resume via the Day 3 API endpoint.

## 12. Key Findings
1. **High Quality & Complete Data**: Zero missing fields and zero duplicates across all 200 records.
2. **Standardized Schema**: Job titles, locations, experience ranges, and company types follow clean categorical distributions.
3. **Pervasive Skill Requirements**: Python (65%) and SQL (60%) are the dominant core skills across software, data, and AI job postings.
4. **Early-Career Target**: All jobs fall within the 0 to 4 years experience range.

## 13. Confirmed Features for ATS and Recommendation
Based strictly on the observed data, the following features are confirmed for Milestone 1 heuristic ATS parsing and recommendation matching:

| Feature Category | Confirmed Feature | Source Field in Data | Use Case in ATS / Recommendation |
| :--- | :--- | :--- | :--- |
| **Skills Match** | Exact Skill Keyword Overlap | `Required Skills` | Compare candidate extracted skills with job required skills |
| **Job Role Match** | Role Title String Similarity | `Job Title` | Match candidate target role / resume title to job title |
| **Experience Match** | Experience Range Eligibility | `Experience` | Check if candidate years of experience falls into target range |
| **Location Match** | Preferred Location / Remote Flag | `Location`, `Remote` | Filter / score job recommendations based on candidate location preference |
| **Job Type Match** | Employment Type | `Job Type` | Filter between Full-time jobs vs Internships |
