from fastapi import APIRouter
from app.api.v1 import jobs, swipes

api_router = APIRouter()

api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs & Feed"])
api_router.include_router(swipes.router, prefix="/swipes", tags=["Swipes & Interactions"])
