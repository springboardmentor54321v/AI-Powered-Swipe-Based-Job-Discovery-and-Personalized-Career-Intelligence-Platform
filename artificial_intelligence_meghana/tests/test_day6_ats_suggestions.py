import os
import sys
import unittest
from unittest.mock import patch, MagicMock

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from src.ats import score_resume_against_job
from src.suggestions import generate_suggestions

class TestDay6ATSAndSuggestions(unittest.TestCase):
    # ATS TESTS
    def test_01_ats_strong_match(self):
        resume = {"skills": ["Python", "SQL", "Docker", "AWS"], "text": "I know python, sql, docker, and aws."}
        job = {"required_skills": ["Python", "SQL", "Docker", "AWS"], "keywords": ["Agile"]}
        res = score_resume_against_job(resume, job)
        self.assertEqual(res["match_score"], 80.0) # 4/5 match
        self.assertEqual(len(res["missing_keywords"]), 0) # Misses Agile, but score >= 80 means missing lists are empty
        
    def test_02_ats_partial_match(self):
        resume = {"skills": ["Python"], "text": "I know Python."}
        job = {"required_skills": ["Python", "SQL", "Docker"], "keywords": []}
        res = score_resume_against_job(resume, job)
        self.assertEqual(res["match_score"], 33.33)
        self.assertIn("SQL", res["missing_skills"])
        self.assertIn("Docker", res["missing_skills"])

    def test_03_ats_no_match(self):
        resume = {"skills": ["Java"], "text": "I know Java."}
        job = {"required_skills": ["Python", "SQL"], "keywords": []}
        res = score_resume_against_job(resume, job)
        self.assertEqual(res["match_score"], 0.0)
        self.assertIn("Python", res["missing_skills"])
        self.assertIn("SQL", res["missing_skills"])

    def test_04_ats_missing_skills_and_keywords(self):
        resume = {"skills": [], "text": "Hard working."}
        job = {"required_skills": ["Python"], "keywords": ["Agile"]}
        res = score_resume_against_job(resume, job)
        self.assertIn("Python", res["missing_skills"])
        self.assertIn("Agile", res["missing_keywords"])

    def test_05_ats_semantic_similarity_blended(self):
        with patch('src.semantic.SentenceTransformer') as mock_transformer, patch('src.semantic.util.cos_sim') as mock_cos:
            from src.semantic import SemanticEngine
            mock_cos.return_value = MagicMock(item=MagicMock(return_value=1.0)) # 100% sim
            engine = SemanticEngine(persist_dir="dummy")
            resume = {"skills": ["Python"], "text": "Python dev."}
            job = {"required_skills": ["Python"], "description": "Python dev wanted."}
            config = {"keyword_weight": 0.5, "semantic_weight": 0.5}
            res = score_resume_against_job(resume, job, semantic_engine=engine, config=config)
            self.assertEqual(res["match_score"], 100.0)
            self.assertEqual(res["generated_by"], "blended-v1")

    def test_06_ats_empty_resume_and_job(self):
        res1 = score_resume_against_job({"skills": []}, {"required_skills": ["Python"]})
        self.assertEqual(res1["match_score"], 0.0)
        res2 = score_resume_against_job({"skills": ["Python"]}, {"required_skills": []})
        self.assertEqual(res2["match_score"], 100.0)

    # SUGGESTION TESTS
    def test_07_suggestions_missing_skills(self):
        sugg = generate_suggestions({"score": 60, "missing_skills": ["Python"]})
        self.assertTrue(any("learning or adding the skill 'Python'" in s for s in sugg))
        
    def test_08_suggestions_missing_keywords(self):
        sugg = generate_suggestions({"score": 75, "missing_keywords": ["Agile"]})
        self.assertTrue(any("does not mention the keyword 'Agile'" in s for s in sugg))

    def test_09_suggestions_weak_coverage(self):
        sugg = generate_suggestions({"score": 40})
        self.assertTrue(any("score is weak" in s for s in sugg))

    def test_10_suggestions_strong_coverage(self):
        sugg = generate_suggestions({"score": 90})
        self.assertTrue(any("strong keyword and skill overlap" in s for s in sugg))

    def test_11_suggestions_empty_missing_data(self):
        sugg = generate_suggestions(None)
        self.assertTrue(any("Upload a valid resume" in s for s in sugg))

    def test_12_suggestions_duplicate_prevention(self):
        # Even if multiple rules trigger same feedback, deduplication preserves order
        sugg = generate_suggestions({"score": 90, "missing_skills": ["Python", "Python"]})
        self.assertEqual(len(sugg), len(set(sugg)))

if __name__ == '__main__':
    unittest.main()
