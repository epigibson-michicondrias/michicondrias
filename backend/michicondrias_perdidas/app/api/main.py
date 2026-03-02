from fastapi import APIRouter
from app.api.routes import lost_pets, places

api_router = APIRouter()
api_router.include_router(lost_pets.router, prefix="/reports", tags=["lost_found_reports"])
api_router.include_router(places.router, prefix="/places", tags=["petfriendly_places"])
