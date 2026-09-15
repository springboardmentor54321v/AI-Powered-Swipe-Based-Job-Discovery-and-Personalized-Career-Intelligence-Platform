import importlib.util
import sys
import unittest
from datetime import datetime
from pathlib import Path

MODULE = Path(__file__).parents[1] / "scripts" / "build_seed_data.py"
spec = importlib.util.spec_from_file_location("build_seed_data", MODULE)
seed = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = seed
spec.loader.exec_module(seed)


class SeedBuilderTests(unittest.TestCase):
    def test_skills_are_normalized_and_deduplicated(self):
        self.assertEqual(seed.skills("Python, SQL, python , Machine Learning"), "python|sql|machine learning")

    def test_html_is_removed(self):
        self.assertEqual(seed.clean_text("<p>Build&nbsp; APIs</p>"), "Build APIs")

    def test_relative_dates_use_declared_reference(self):
        reference = datetime.fromisoformat("2025-10-01T12:00:00+05:30")
        self.assertEqual(seed.infer_posted_at("4 Days Ago", reference), "2025-09-27T12:00:00+05:30")
        self.assertEqual(seed.infer_posted_at("Starts in 1-3 months", reference), None)
        self.assertEqual(seed.infer_posted_at("Today", None), None)

    def test_duplicate_prefers_more_complete_row(self):
        import pandas as pd
        frame = pd.DataFrame([
            {"jobId": 7, "title": "Data Analyst", "companyName": "A", "tagsAndSkills": None, "jobDescription": "Short", "location": "Pune", "minimumSalary": None, "maximumSalary": None, "minimumExperience": None, "maximumExperience": None},
            {"jobId": 7, "title": "Data Analyst", "companyName": "A", "tagsAndSkills": "SQL", "jobDescription": "A longer useful description", "location": "Pune", "minimumSalary": 1, "maximumSalary": 2, "minimumExperience": 1, "maximumExperience": 2},
        ])
        kept, rejected = seed.deduplicate(frame)
        self.assertEqual(len(kept), 1)
        self.assertEqual(len(rejected), 1)
        self.assertEqual(kept.iloc[0]["tagsAndSkills"], "SQL")


if __name__ == "__main__":
    unittest.main()
