"""Day 4 semantic similarity using sentence-transformers."""

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


MODEL_NAME = "all-MiniLM-L6-v2"

# The model is loaded only once.
_model = None


def get_model():
    """Load and reuse the sentence-transformer model."""

    global _model

    if _model is None:
        print("Loading sentence-transformer model...")
        _model = SentenceTransformer(MODEL_NAME)

    return _model


def calculate_semantic_similarity(
    resume_text,
    job_description,
):
    """Calculate similarity between resume text and job description.

    Returns:
        A tuple:
        (
            cosine_similarity_value,
            semantic_score_from_0_to_100
        )
    """

    if not isinstance(resume_text, str):
        raise TypeError("resume_text must be a string")

    if not isinstance(job_description, str):
        raise TypeError("job_description must be a string")

    if not resume_text.strip():
        raise ValueError("resume_text cannot be empty")

    if not job_description.strip():
        raise ValueError("job_description cannot be empty")

    model = get_model()

    embeddings = model.encode(
        [resume_text, job_description],
        normalize_embeddings=True,
    )

    resume_embedding = embeddings[0].reshape(1, -1)
    job_embedding = embeddings[1].reshape(1, -1)

    similarity = float(
        cosine_similarity(
            resume_embedding,
            job_embedding,
        )[0][0]
    )

    # Because embeddings are normalized, similarity is normally between 0 and 1.
    # Convert it directly into a 0-100 score.
    semantic_score = similarity * 100.0

    # Keep the score safely between 0 and 100.
    semantic_score = max(
        0.0,
        min(100.0, semantic_score),
    )

    return round(similarity, 4), round(semantic_score, 2)


def main():
    """Run a simple semantic similarity test."""

    resume_text = (
        "Backend developer with experience in Python, Django, "
        "SQL, REST APIs, and Git."
    )

    job_description = (
        "We are looking for a backend developer with experience "
        "in Python, Django, SQL, REST APIs, and database systems."
    )

    similarity, semantic_score = calculate_semantic_similarity(
        resume_text,
        job_description,
    )

    print()
    print("Semantic similarity:", similarity)
    print("Semantic score:", semantic_score)


if __name__ == "__main__":
    main()
