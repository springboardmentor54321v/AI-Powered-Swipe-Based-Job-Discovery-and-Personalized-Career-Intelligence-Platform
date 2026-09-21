from fastapi import APIRouter

router = APIRouter()

# Stub endpoint just to verify Gateway routing
@router.post("/score")
async def score_resume():
    return {"message": "ATS controller stub"}
