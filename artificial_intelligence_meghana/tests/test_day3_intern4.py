import os
import sys
import unittest

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from src.ats import score_resume_against_job, calculate_ats_score, ATS_MISSING_THRESHOLD

class TestDay3ATS(unittest.TestCase):
    def test_01_all_matched_100_percent(self):
        resume = {"skills": ["Python", "SQL"], "text": "Kubernetes inside Docker."}
        job = {"required_skills": ["Python", "SQL"], "keywords": ["Docker", "Kubernetes"]}
        res = score_resume_against_job(resume, job)
        self.assertEqual(res["score"], 100.0)
        self.assertEqual(res["missing_skills"], [])
        self.assertEqual(res["missing_keywords"], [])

    def test_02_missing_detected_below_threshold(self):
        """When score < 80, missing lists should populate"""
        resume = {"skills": ["Python"], "text": "Nothing much here."}
        job = {"required_skills": ["Python", "SQL"], "keywords": ["Docker", "Kubernetes"]}
        # Total req = 4, matches = 1 (Python). Score = 25%
        res = score_resume_against_job(resume, job)
        self.assertEqual(res["score"], 25.0)
        self.assertIn("SQL", res["missing_skills"])
        self.assertIn("Docker", res["missing_keywords"])
        self.assertIn("Kubernetes", res["missing_keywords"])

    def test_03_no_missing_returned_above_threshold(self):
        """When score >= 80%, missing lists should be explicitly empty"""
        resume = {"skills": ["Python", "SQL", "Docker", "AWS"], "text": "Agile"}
        job = {"required_skills": ["Python", "SQL", "Docker", "AWS"], "keywords": ["Agile", "Scrum"]}
        # Total req = 6, matches = 5 (Missing Scrum). Score = 83.33% > 80%
        res = score_resume_against_job(resume, job)
        self.assertGreaterEqual(res["score"], ATS_MISSING_THRESHOLD)
        self.assertEqual(res["missing_skills"], []) # suppressed due to threshold
        self.assertEqual(res["missing_keywords"], []) # suppressed due to threshold

    def test_04_casing_and_duplicates_normalized(self):
        """Ensure duplicated/weird-cased targets match appropriately"""
        resume = {"skills": ["PYTHON", "  sQl "], "text": "docker DOCKER DoCkEr!"}
        job = {"required_skills": ["Python", "SQL"], "keywords": ["Docker", "Docker"]}
        res = score_resume_against_job(resume, job)
        self.assertEqual(res["score"], 100.0)

    def test_05_empty_input_graceful(self):
        resume = {"skills": [], "text": ""}
        job = {"required_skills": [], "keywords": []}
        res = score_resume_against_job(resume, job)
        self.assertEqual(res["score"], 100.0)

    def test_06_backwards_compatible_calculate_ats_score(self):
        resume_skills = ["Python", "Docker"]
        job_skills = ["Python", "Docker", "Git"]
        res = calculate_ats_score(resume_skills, job_skills)
        # Total req: 3, matched: 2 -> Score 66.67
        self.assertEqual(res["match_score"], 66.67)
        self.assertEqual(res["missing_skills"], ["Git"])
        self.assertEqual(res["generated_by"], "heuristic-v1")

if __name__ == "__main__":
    unittest.main()
