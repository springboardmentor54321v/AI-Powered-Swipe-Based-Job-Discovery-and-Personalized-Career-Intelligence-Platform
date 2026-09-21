from fastapi import APIRouter

router = APIRouter()

# Stub endpoint just to verify Gateway routing
@router.get("/")
async def list_resumes():
    return {"message": "Resume controller stub"}
