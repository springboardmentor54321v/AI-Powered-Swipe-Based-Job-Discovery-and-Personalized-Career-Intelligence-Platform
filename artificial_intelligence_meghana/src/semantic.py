import os
import chromadb
from sentence_transformers import SentenceTransformer, util

class SemanticEngine:
    """
    Day 4 Semantic Engine: 
    Encapsulates sentence-transformers handling and local ChromaDB persistent persistence.
    """
    def __init__(self, persist_dir="data/chroma_db", collection_name="jobs_collection"):
        # We lazy load the embedding model to avoid enormous application start times
        self.model = None 
        self.persist_dir = persist_dir
        
        # Ensure persistence directory exists
        if not os.path.exists(self.persist_dir):
            os.makedirs(self.persist_dir)
            
        self.client = chromadb.PersistentClient(path=self.persist_dir)
        self.collection = self.client.get_or_create_collection(
            name=collection_name, 
            metadata={"hnsw:space": "cosine"}
        )
        
    def _get_model(self):
        if self.model is None:
            # Lightweight semantic embedding architecture
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
        return self.model

    def generate_embedding(self, text: str) -> list[float]:
        """Generate embedding vector list for a given text."""
        if not text:
            # Fallback for completely empty textual bodies
            text = "empty"
        model = self._get_model()
        return model.encode(text).tolist()

    def store_job_embedding(self, job_id: str, text: str, metadata: dict = None):
        """
        Store or update a job vector in ChromaDB with associated metadata schema.
        Handles the Day 4 persistence prerequisite.
        """
        if not text:
            return
        meta = metadata or {}
        embedding = self.generate_embedding(text)
        
        self.collection.upsert(
            documents=[text],
            embeddings=[embedding],
            metadatas=[meta],
            ids=[job_id]
        )

    def query_similar_jobs(self, resume_text: str, n_results: int = 5):
        """Query ChromaDB for n nearest jobs to the input resume mapping text."""
        if not resume_text:
            return []
        resume_emb = self.generate_embedding(resume_text)
        results = self.collection.query(
            query_embeddings=[resume_emb],
            n_results=n_results
        )
        return results

    def calculate_semantic_similarity(self, text1: str, text2: str) -> float:
        """
        Calculate direct cosine similarity between two texts and normalize to an intuitive 0-100 score.
        Useful when blending scores for a specific known Candidate + Job pair in ATS scoring.
        """
        if not text1 or not text2:
            return 0.0
            
        model = self._get_model()
        emb1 = model.encode(text1)
        emb2 = model.encode(text2)
        
        # Compute standard semantic PyTorch cosine similarity
        cos_sim = util.cos_sim(emb1, emb2).item()
        
        # Normalize the standard cosine boundary [-1, 1] explicitly to [0, 100]
        # Text similarity usually produces >0 but deterministic boundary capping handles extreme variance.
        score = max(0.0, min(100.0, ((cos_sim + 1.0) / 2.0) * 100.0))
        return round(score, 2)

if __name__ == "__main__":
    print("=== SwipeX Semantic Operations Module (src/semantic.py) ===")
    print("Module imported successfully. Wraps local ChromaDB deployment internally.")
