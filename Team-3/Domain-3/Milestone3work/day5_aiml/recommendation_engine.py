from typing import Dict, List, Any, Set
from intern2_client import fetch_user_swipe_history, fetch_all_jobs

class UpgradedRecommendationEngine:
    """
    Day 5 Task 2: Recommendation Engine upgrade.
    Blends semantic similarity with Intern 2's Milestone 2 swipe-history heuristic.
    """

    def __init__(self):
        # Weighting: 70% Semantic Vector Similarity, 30% Swipe History Heuristic
        self.semantic_weight = 0.7
        self.swipe_weight = 0.3

    def _calculate_mock_semantic_similarity(self, resume_text: str, job: Dict[str, Any]) -> float:
        """
        Simulates Sentence-Transformers embedding cosine similarity between candidate resume & job description.
        In Day 4 production: query ChromaDB vector store.
        """
        resume_words = set(resume_text.lower().split())
        job_skills = set(s.lower() for s in job.get("required_skills", []))
        
        if not job_skills:
            return 0.5

        overlap = len(resume_words.intersection(job_skills))
        sim_score = 0.4 + (overlap / len(job_skills)) * 0.55
        return min(0.99, max(0.10, sim_score))

    def _parse_swipe_history(self, swipe_response: Dict[str, Any]) -> Dict[str, Set[int]]:
        """
        Extracts liked (right swipe) and disliked (left swipe) job IDs from Intern 2's API payload.
        """
        history = swipe_response.get("history", [])
        liked = set()
        disliked = set()

        for record in history:
            job_id = record.get("job_id")
            direction = record.get("direction")
            if direction == "right":
                liked.add(job_id)
            elif direction == "left":
                disliked.add(job_id)

        return {"liked": liked, "disliked": disliked}

    def get_recommendations(
        self,
        user_id: str,
        user_resume_text: str,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Main Day 5 Recommendation Pipeline:
        1. Fetch real jobs and swipe history from Intern 2's API Gateway.
        2. Filter out jobs the user previously swiped left (disliked).
        3. Compute semantic similarity score.
        4. Apply swipe-history heuristic boost/penalty.
        5. Return top_k ranked recommendations.
        """
        # Fetch real data via Intern 2's Gateway
        swipe_payload = fetch_user_swipe_history(user_id)
        all_jobs = fetch_all_jobs()

        swipes = self._parse_swipe_history(swipe_payload)
        liked_ids = swipes["liked"]
        disliked_ids = swipes["disliked"]

        recommendations = []

        for job in all_jobs:
            job_id = job.get("job_id")

            # HEURISTIC 1: Filter out explicitly rejected/disliked jobs (Swipe Left)
            if job_id in disliked_ids:
                print(f"[Rec Engine] Filtering out Job ID {job_id} ('{job.get('job_title')}') - User swiped LEFT.")
                continue

            # STEP 1: Compute Semantic Similarity
            semantic_score = self._calculate_mock_semantic_similarity(user_resume_text, job)

            # HEURISTIC 2: Swipe History Boost (Swipe Right)
            if job_id in liked_ids:
                # 20% score boost for liked jobs/companies
                swipe_heuristic_boost = 0.20
                print(f"[Rec Engine] Applying +20% Swipe Boost to Job ID {job_id} ('{job.get('job_title')}').")
            else:
                swipe_heuristic_boost = 0.0

            # STEP 2: Blended Final Score
            final_blended_score = min(1.0, semantic_score + swipe_heuristic_boost)

            recommendations.append({
                "job_id": job_id,
                "job_title": job.get("job_title"),
                "company": job.get("company"),
                "required_skills": job.get("required_skills"),
                "semantic_similarity_score": round(semantic_score, 4),
                "swipe_boost": round(swipe_heuristic_boost, 2),
                "final_match_percentage": round(final_blended_score * 100, 2)
            })

        # Rank by final match percentage descending
        recommendations.sort(key=lambda x: x["final_match_percentage"], reverse=True)
        return recommendations[:top_k]
