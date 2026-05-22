from fastapi import APIRouter
from app.api.v1 import (
    auth,
    jobs,
    search,
    recommendations,
    bookmarks,
    applications,
    analytics,
    recruiters,
    notifications,
)

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(jobs.router)
api_router.include_router(search.router)
api_router.include_router(recommendations.router)
api_router.include_router(bookmarks.router)
api_router.include_router(applications.router)
api_router.include_router(analytics.router)
api_router.include_router(recruiters.router)
api_router.include_router(notifications.router)
