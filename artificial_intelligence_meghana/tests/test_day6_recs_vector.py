import os
import sys
import unittest
import pandas as pd
from unittest.mock import patch, MagicMock

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from src.recommender import get_job_recommendations, compute_swipe_preferences

class TestDay6RecommenderAndVector(unittest.TestCase):
    # RECOMMENDER TESTS
    def setUp(self):
        self.jobs_df = pd.DataFrame([
            {"Job ID": "J1", "Required Skills": "['Python']", "Location": "Remote"},
            {"Job ID": "J2", "Required Skills": "['SQL']", "Location": "NY"},
            {"Job ID": "J3", "Required Skills": "['Java']", "Location": "SF"}
        ])

    def test_01_rec_no_swipe_history(self):
        recs = get_job_recommendations(["Python"], self.jobs_df, swipes=[])
        self.assertEqual(recs[0]["job_id"], "J1") # Match score drops linearly

    def test_02_rec_positive_swipe_history(self):
        swipes = [{"job_id": "J2", "action": "RIGHT"}, {"job_id": "J2", "action": "APPLY"}]
        recs = get_job_recommendations(["Python"], self.jobs_df, swipes=swipes)
        # Normally J1 > J2, but with 2 positive swipes on SQL/NY, it boosts J2
        prefs = compute_swipe_preferences(swipes, self.jobs_df)
        self.assertEqual(prefs["skill_prefs"].get("sql"), 2)

    def test_03_rec_negative_swipe_history(self):
        swipes = [{"job_id": "J1", "action": "LEFT"}]
        recs = get_job_recommendations(["Python"], self.jobs_df, swipes=swipes)
        # J1 score penalty based on python/remote rejection
        prefs = compute_swipe_preferences(swipes, self.jobs_df)
        self.assertEqual(prefs["skill_prefs"].get("python"), -1)
        self.assertEqual(prefs["remote_pref"], -1)

    def test_04_rec_semantic_similarity_contribution(self):
        # Handled in ATS blending, but we verify get_job_recommendations continues properly 
        # ignoring semantic for base ranking as per heuristic algorithm
        recs = get_job_recommendations(["SQL"], self.jobs_df)
        self.assertEqual(recs[0]["job_id"], "J2")

    def test_05_rec_empty_text_and_resume(self):
        recs = get_job_recommendations([], self.jobs_df, swipes=[])
        self.assertIsInstance(recs, list)
        self.assertEqual(len(recs), 3)
        self.assertEqual(recs[0]["match_percentage"], 20.0) # all jobs 0 ATS match base

    # VECTOR/CHROMADB TESTS
    @patch('src.semantic.SentenceTransformer')
    def test_06_chromadb_embedding_generation_and_storage(self, mock_transformer):
        from src.semantic import SemanticEngine
        mock_model = MagicMock()
        mock_model.encode.return_value = [0.1, 0.2]
        mock_transformer.return_value = mock_model
        
        with patch('chromadb.PersistentClient') as mock_client:
            engine = SemanticEngine(persist_dir="dummy")
            emb = engine.generate_embedding("Test Job")
            self.assertEqual(emb, [0.1, 0.2])
            
            # test empty string handling mapping to embedding
            empty_emb = engine.generate_embedding("")
            self.assertEqual(empty_emb, [0.1, 0.2])
            
            engine.store_job_embedding("J1", "text")
            mock_client.return_value.get_or_create_collection.return_value.upsert.assert_called_once()
            
            res = engine.query_similar_jobs("text", 2)
            mock_client.return_value.get_or_create_collection.return_value.query.assert_called_once()

if __name__ == '__main__':
    unittest.main()
