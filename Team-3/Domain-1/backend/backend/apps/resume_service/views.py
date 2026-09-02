from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class UploadResumePlaceholderView(APIView):
    """Placeholder for POST /api/v1/resume/upload. Owned by Intern 3."""
    def post(self, request):
        return Response(
            {"message": "Resume Service: Upload resume placeholder (Day 2 Skeleton)."},
            status=status.HTTP_501_NOT_IMPLEMENTED
        )

class ATSScorePlaceholderView(APIView):
    """Placeholder for GET /api/v1/resume/{resume_id}/ats-score. Owned by Intern 3."""
    def get(self, request, resume_id):
        job_id = request.query_params.get("job_id", "")
        return Response(
            {
                "message": f"Resume Service: ATS score placeholder for resume {resume_id} and job {job_id} (Day 2 Skeleton).",
                "generated_by": "heuristic-v0"
            },
            status=status.HTTP_501_NOT_IMPLEMENTED
        )

class RecommendationsPlaceholderView(APIView):
    """Placeholder for GET /api/v1/recommendations. Owned by Intern 3."""
    def get(self, request):
        user_id = request.query_params.get("user_id", "")
        return Response(
            {"message": f"Recommendation Service: Recommendations placeholder for user {user_id} (Day 2 Skeleton)."},
            status=status.HTTP_501_NOT_IMPLEMENTED
        )
