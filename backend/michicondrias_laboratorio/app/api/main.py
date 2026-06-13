from fastapi import APIRouter
from app.api.routes import labs

api_router = APIRouter()
api_router.include_router(labs.router, prefix="/labs", tags=["laboratorios"])
