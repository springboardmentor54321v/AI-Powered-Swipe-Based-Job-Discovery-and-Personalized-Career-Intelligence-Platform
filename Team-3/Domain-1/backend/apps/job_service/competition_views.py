from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db import connection

class CompetitionDetailView(APIView):
    permission_classes = [AllowAny]
    
    @extend_schema(responses={200: dict}, tags=['Jobs'])
    def get(self, request, job_id):
        with connection.cursor() as cursor:
            cursor.execute('''
                SELECT applicant_count, competition_level, competition_updated_at 
                FROM jobs WHERE id = %s
            ''', [job_id])
            row = cursor.fetchone()
            if not row:
                return Response({"detail": "Job not found"}, status=404)
                
            return Response({
                "job_id": job_id,
                "applicant_count": row[0],
                "competition_level": row[1],
                "competition_updated_at": row[2]
            })