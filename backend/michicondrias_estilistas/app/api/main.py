from fastapi import APIRouter
from app.api.routes import grooming

api_router = APIRouter()
api_router.include_router(grooming.router, prefix="/grooming", tags=["grooming"])
