# Day 2 — EDA Notes (Real Dataset)

## Dataset Used
indian-job-market-dataset-2025.xlsx — Indian job market dataset (source: Intern 2)

## Before Cleaning
97,929 rows, 17 columns

## Cleaning Performed
- Dropped rows missing skills, minimum experience, or maximum experience (571 rows removed)
- Converted `tagsAndSkills` (comma-separated string) into a proper Python list for easier comparison
- Treated salary values of 0 as "unknown" instead of a real ₹0 salary

## After Cleaning
97,358 usable rows (99.4% of original data retained)

## Key Fields Confirmed for Matching Logic
- skills_list — list of required skills per job
- minimumExperience / maximumExperience — numeric, clean, ready to compare against resume experience
- title — job title, useful for basic role similarity later

## Observations
- Skills are well-tagged and consistent (comma-separated, readable)
- Salary field had some "Not disclosed" / 0 values — handled by treating as unknown
- Experience is given as both text ("2-4 Yrs") and clean numbers — using the numeric columns for logic