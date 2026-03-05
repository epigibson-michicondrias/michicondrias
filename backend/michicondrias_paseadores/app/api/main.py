from fastapi import APIRouter
from app.api.routes import walkers

api_router = APIRouter()
api_router.include_router(walkers.router, prefix="/walkers", tags=["walkers"])
