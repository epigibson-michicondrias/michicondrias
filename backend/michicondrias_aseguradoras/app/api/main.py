from fastapi import APIRouter
from app.api.routes import insurance

api_router = APIRouter()
api_router.include_router(insurance.router, prefix="/insurance", tags=["insurance"])
