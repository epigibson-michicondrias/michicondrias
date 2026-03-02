from fastapi import APIRouter
from app.api.routes import lost_pets, places, pets

api_router = APIRouter()
api_router.include_router(lost_pets.router, prefix="/lost-pets", tags=["lost_pets"])
api_router.include_router(places.router, prefix="/places", tags=["petfriendly_places"])
api_router.include_router(pets.router, prefix="/pets", tags=["pets"])
