from fastapi import APIRouter
from app.api.routes import login, users, roles, settings, analytics, search, notifications, system

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(roles.router, prefix="/roles", tags=["roles"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(system.router, tags=["system"])

