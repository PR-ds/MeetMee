from fastapi import APIRouter
from app.api.v1.meetings import router as meetings_router
from app.api.v1.transcripts import router as transcripts_router
from app.api.v1.summaries import router as summaries_router
from app.api.v1.podcasts import router as podcasts_router
from app.api.v1.comics import router as comics_router
from app.api.v1.users import router as users_router

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(users_router)
api_v1_router.include_router(meetings_router)
api_v1_router.include_router(transcripts_router)
api_v1_router.include_router(summaries_router)
api_v1_router.include_router(podcasts_router)
api_v1_router.include_router(comics_router)
