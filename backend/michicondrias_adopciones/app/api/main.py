from fastapi import APIRouter
from app.api.routes import pets

api_router = APIRouter()
api_router.include_router(pets.router, prefix="/pets", tags=["pets"])
