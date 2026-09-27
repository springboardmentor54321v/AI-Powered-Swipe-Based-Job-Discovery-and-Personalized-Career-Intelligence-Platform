"""Day 4 ChromaDB storage and semantic search for SwipeX jobs.

This module stores job-description embeddings created by the existing
sentence-transformer model. It does not generate suggestions and does not
replace the keyword ATS scorer.

Copy this file into:
    scoring/chromadb_job_store.py
"""

from pathlib import Path
from typing import Any, Dict, List, Optional

import chromadb

try:
    # Package execution from the project root.
    from .semantic_similarity import get_model
except ImportError:
    # Direct execution from inside the scoring folder.
    from semantic_similarity import get_model


# The database is stored locally in this folder.
CHROMA_PATH = Path(__file__).resolve().parent.parent / "chroma_data"
COLLECTION_NAME = "swipex_jobs"


class JobEmbeddingStore:
    """Store and search job-description embeddings in local ChromaDB."""

    def __init__(self, database_path: str = str(CHROMA_PATH)) -> None:
        self.client = chromadb.PersistentClient(path=database_path)
        self.collection = self.client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"description": "SwipeX job description embeddings"},
        )

    def store_job(
        self,
        job_id: str,
        job_description: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Create or update one job embedding.

        Args:
            job_id: Unique job identifier. ChromaDB IDs must be strings.
            job_description: Full text of the job description.
            metadata: Optional values such as title or location. Values must
                be strings, integers, floats, or booleans for ChromaDB.
        """
        if not str(job_id).strip():
            raise ValueError("job_id cannot be empty")

        if not isinstance(job_description, str) or not job_description.strip():
            raise ValueError("job_description cannot be empty")

        model = get_model()
        embedding = model.encode(
            job_description,
            normalize_embeddings=True,
        ).tolist()

        safe_metadata: Dict[str, Any] = dict(metadata or {})
        safe_metadata["job_id"] = str(job_id)

        self.collection.upsert(
            ids=[str(job_id)],
            embeddings=[embedding],
            documents=[job_description],
            metadatas=[safe_metadata],
        )

    def search_jobs(
        self,
        resume_text: str,
        number_of_results: int = 5,
    ) -> List[Dict[str, Any]]:
        """Return jobs semantically most similar to the resume text."""
        if not isinstance(resume_text, str) or not resume_text.strip():
            raise ValueError("resume_text cannot be empty")

        if number_of_results < 1:
            raise ValueError("number_of_results must be at least 1")

        if self.collection.count() == 0:
            return []

        model = get_model()
        resume_embedding = model.encode(
            resume_text,
            normalize_embeddings=True,
        ).tolist()

        result = self.collection.query(
            query_embeddings=[resume_embedding],
            n_results=min(number_of_results, self.collection.count()),
            include=["documents", "metadatas", "distances"],
        )

        jobs: List[Dict[str, Any]] = []
        ids = result.get("ids", [[]])[0]
        documents = result.get("documents", [[]])[0]
        metadatas = result.get("metadatas", [[]])[0]
        distances = result.get("distances", [[]])[0]

        for index, job_id in enumerate(ids):
            distance = float(distances[index]) if distances else None
            # With cosine distance, similarity is approximately 1 - distance.
            similarity = None if distance is None else max(0.0, 1.0 - distance)

            jobs.append(
                {
                    "job_id": job_id,
                    "job_description": documents[index],
                    "metadata": metadatas[index],
                    "cosine_similarity": (
                        None if similarity is None else round(similarity, 4)
                    ),
                    "semantic_score": (
                        None
                        if similarity is None
                        else round(similarity * 100.0, 2)
                    ),
                }
            )

        return jobs


def main() -> None:
    """Store sample jobs and search them using a sample resume."""
    store = JobEmbeddingStore()

    store.store_job(
        job_id="101",
        job_description=(
            "Backend developer needed with Python, Django, SQL, REST APIs, "
            "Docker, and Git experience."
        ),
        metadata={"title": "Backend Developer"},
    )

    store.store_job(
        job_id="102",
        job_description=(
            "Machine learning engineer needed with Python, PyTorch, NLP, "
            "and model training experience."
        ),
        metadata={"title": "Machine Learning Engineer"},
    )

    resume = (
        "Backend developer experienced with Python, Django, SQL, REST APIs, "
        "and Git."
    )

    print("Stored job count:", store.collection.count())
    print("\nJobs most similar to the resume:\n")

    for job in store.search_jobs(resume, number_of_results=2):
        print(job)


if __name__ == "__main__":
    main()
