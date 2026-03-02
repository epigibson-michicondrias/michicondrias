from fastapi import APIRouter
from app.api.routes import login, users, roles, settings

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(roles.router, prefix="/roles", tags=["roles"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
# Aquí iremos agregando mascotas, adopciones, etc.
