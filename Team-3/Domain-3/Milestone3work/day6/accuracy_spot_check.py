import json
from typing import List, Dict

class AccuracySpotCheckRunner:
    """
    Day 6 Task 2: Spot-check scoring accuracy against a hand-labeled sample set.
    Evaluates AI-predicted ATS match scores against Human Ground-Truth labels.
    """

    def __init__(self):
        # 5 Hand-labeled benchmark sample pairs (Human Expert Ratings)
        self.hand_labeled_dataset = [
            {
                "sample_id": 1,
                "resume_skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "Git"],
                "job_required_skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "Git"],
                "human_expected_match_pct": 100.0,
                "description": "Perfect Skill Match"
            },
            {
                "sample_id": 2,
                "resume_skills": ["Python", "Django", "MySQL"],
                "job_required_skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "Kubernetes"],
                "human_expected_match_pct": 20.0,
                "description": "Low Keyword Match"
            },
            {
                "sample_id": 3,
                "resume_skills": ["Python", "FastAPI", "PyTorch", "spaCy", "ChromaDB"],
                "job_required_skills": ["Python", "FastAPI", "Sentence-Transformers", "ChromaDB"],
                "human_expected_match_pct": 75.0,
                "description": "High AI/ML Specialty Match"
            },
            {
                "sample_id": 4,
                "resume_skills": ["Java", "Spring Boot", "Oracle"],
                "job_required_skills": ["Python", "FastAPI", "PostgreSQL"],
                "human_expected_match_pct": 0.0,
                "description": "Zero Match"
            },
            {
                "sample_id": 5,
                "resume_skills": ["Python", "FastAPI", "Docker", "AWS"],
                "job_required_skills": ["Python", "FastAPI", "Docker", "Kubernetes"],
                "human_expected_match_pct": 75.0,
                "description": "Strong DevOps/Backend Match"
            }
        ]

    def run_spot_check(self) -> Dict:
        results = []
        total_error = 0.0

        for sample in self.hand_labeled_dataset:
            resume_set = set(s.lower() for s in sample["resume_skills"])
            job_set = set(s.lower() for s in sample["job_required_skills"])
            
            matched = resume_set.intersection(job_set)
            ai_score = (len(matched) / len(job_set) * 100) if job_set else 0.0
            
            human_score = sample["human_expected_match_pct"]
            abs_error = abs(ai_score - human_score)
            total_error += abs_error
            
            results.append({
                "sample_id": sample["sample_id"],
                "description": sample["description"],
                "human_expected_pct": human_score,
                "ai_predicted_pct": round(ai_score, 2),
                "absolute_error": round(abs_error, 2)
            })

        mean_absolute_error = total_error / len(self.hand_labeled_dataset)
        accuracy_score = max(0.0, 100.0 - mean_absolute_error)

        return {
            "spot_check_samples": len(results),
            "mean_absolute_error_pct": round(mean_absolute_error, 2),
            "overall_accuracy_rating_pct": round(accuracy_score, 2),
            "sample_details": results
        }

if __name__ == "__main__":
    runner = AccuracySpotCheckRunner()
    report = runner.run_spot_check()
    print(json.dumps(report, indent=2))
