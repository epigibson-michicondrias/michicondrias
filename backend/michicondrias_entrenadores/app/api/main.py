from fastapi import APIRouter
from app.api.routes import training

api_router = APIRouter()
api_router.include_router(training.router, prefix="/training", tags=["training"])
