from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class ListJobsPlaceholderView(APIView):
    """Placeholder for GET /api/v1/jobs. Owned by Intern 2."""
    def get(self, request):
        return Response(
            {"message": "Job Service: List/filter jobs placeholder (Day 2 Skeleton)."},
            status=status.HTTP_501_NOT_IMPLEMENTED
        )

class JobDetailPlaceholderView(APIView):
    """Placeholder for GET /api/v1/jobs/{job_id}. Owned by Intern 2."""
    def get(self, request, job_id):
        return Response(
            {"message": f"Job Service: Job details placeholder for ID {job_id} (Day 2 Skeleton)."},
            status=status.HTTP_501_NOT_IMPLEMENTED
        )

class SaveSwipePlaceholderView(APIView):
    """Placeholder for POST /api/v1/swipes. Owned by Intern 2."""
    def post(self, request):
        return Response(
            {"message": "Swipe Service: Record swipe placeholder (Day 2 Skeleton)."},
            status=status.HTTP_501_NOT_IMPLEMENTED
        )

class SwipeHistoryPlaceholderView(APIView):
    """Placeholder for GET /api/v1/swipes/history. Owned by Intern 2."""
    def get(self, request):
        return Response(
            {"message": "Swipe Service: Swipe history placeholder (Day 2 Skeleton)."},
            status=status.HTTP_501_NOT_IMPLEMENTED
        )
