from fastapi import APIRouter
from app.api.routes import funerary

api_router = APIRouter()
api_router.include_router(funerary.router, prefix="/funerary", tags=["funerary"])
