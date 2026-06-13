from fastapi import APIRouter
from app.api.routes import rides

api_router = APIRouter()
api_router.include_router(rides.router, prefix="/rides", tags=["rides"])
