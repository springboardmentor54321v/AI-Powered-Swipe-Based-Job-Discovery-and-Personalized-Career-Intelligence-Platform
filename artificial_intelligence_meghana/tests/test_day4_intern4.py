import os
import sys
import unittest
import tempfile
import shutil
from unittest.mock import patch, MagicMock

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from src.ats import score_resume_against_job, ATS_MISSING_THRESHOLD
import src.semantic

class TestDay4SemanticAndBlended(unittest.TestCase):

    def setUp(self):
        # Temp dir for local vector storage sandbox
        self.temp_dir = tempfile.mkdtemp()
        
    def tearDown(self):
        # Cleanup vector storage footprint after tests
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_01_blended_ats_score(self):
        """Test the integration between SemanticEngine and ATS engine blending weights"""
        from src.semantic import SemanticEngine
        
        with patch('src.semantic.SentenceTransformer') as mock_transformer, patch('src.semantic.util.cos_sim') as mock_cos:
            # Mock semantics
            mock_model = MagicMock()
            mock_model.encode.return_value = [0.1, 0.2, 0.3] # dummy standard vector shape
            mock_transformer.return_value = mock_model
            
            # Mock cosine similarity specifically for ATS execution
            mock_tensor = MagicMock()
            mock_tensor.item.return_value = 0.50 # Map to 75.0% score  (0.5+1/2 = 0.75 * 100 = 75)
            mock_cos.return_value = mock_tensor
            
            # Fire semantic engine within temporary directory to avoid database conflicts
            engine = SemanticEngine(persist_dir=self.temp_dir)
            
            resume = {"skills": ["Python"], "text": "I am a dev."}
            job = {"required_skills": ["Python", "SQL"], "description": "Needs python and sql."}
            
            # Keyword score: 1 required out of 2 matched -> 50%
            # Semantic score: 75%
            # Weight: Keyword(0.6) = 30, Semantic(0.4) = 30 -> Final: 60.0%
            config = {"keyword_weight": 0.6, "semantic_weight": 0.4}
            
            result = score_resume_against_job(resume, job, semantic_engine=engine, config=config)
            
            self.assertEqual(result["keyword_score"], 50.0)
            self.assertEqual(result["semantic_score"], 75.0)
            self.assertEqual(result["score"], 60.0)
            
            # Threshold testing: < 80% should return missing SQL
            self.assertIn("SQL", result["missing_skills"])
            self.assertEqual(result["generated_by"], "blended-v1")

    def test_02_chromadb_storage_and_query(self):
        """Ensure ChromaDB interface wrapper accurately encapsulates storage functionality"""
        from src.semantic import SemanticEngine
        
        with patch('src.semantic.SentenceTransformer') as mock_transformer:
            # Inject standard deterministic response for embedding size requirement
            mock_model = MagicMock()
            mock_transformer.return_value = mock_model
            
            # Different texts return arbitrary simple vectors 
            def dummy_encode(text):
                if "SQL" in text:
                    return [1.0, 0.0]
                return [0.0, 1.0]
                
            mock_model.encode.side_effect = dummy_encode
            
            engine = SemanticEngine(persist_dir=self.temp_dir)
            engine.store_job_embedding("JOB_1", "Senior Python and SQL Developer.", metadata={"role": "SWE"})
            
            result = engine.query_similar_jobs("I know SQL", n_results=1)
            self.assertIsNotNone(result)

if __name__ == "__main__":
    unittest.main()
