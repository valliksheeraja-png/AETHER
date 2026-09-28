from fastapi import APIRouter
from backend.api.feedback import router as feedback_router
from backend.api.issues import router as issues_router
from backend.api.dashboard import router as dashboard_router
from backend.api.ai import router as ai_router
from backend.api.memory import router as memory_router
from backend.api.releases import router as releases_router
from backend.api.seed import router as seed_router

api_router = APIRouter()
api_router.include_router(dashboard_router)
api_router.include_router(feedback_router)
api_router.include_router(issues_router)
api_router.include_router(ai_router)
api_router.include_router(memory_router)
api_router.include_router(releases_router)
api_router.include_router(seed_router)

__all__ = ["api_router"]
