from fastapi import APIRouter
from app.api.routes import sitters

api_router = APIRouter()
api_router.include_router(sitters.router, prefix="/sitters", tags=["sitters"])
