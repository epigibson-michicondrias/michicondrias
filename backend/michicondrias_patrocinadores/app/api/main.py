from fastapi import APIRouter
from app.api.routes import sponsors

api_router = APIRouter()
api_router.include_router(sponsors.router, prefix="/sponsors", tags=["sponsors"])
