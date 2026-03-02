from fastapi import APIRouter
from app.api.routes import clinics, veterinarians

api_router = APIRouter()
api_router.include_router(clinics.router, prefix="/clinics", tags=["clinics"])
api_router.include_router(veterinarians.router, prefix="/veterinarians", tags=["veterinarians"])
