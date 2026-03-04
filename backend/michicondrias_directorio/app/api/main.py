from fastapi import APIRouter
from app.api.routes import clinics, veterinarians, reviews

api_router = APIRouter()
api_router.include_router(clinics.router, prefix="/clinics", tags=["clinics"])
api_router.include_router(veterinarians.router, prefix="/veterinarians", tags=["veterinarians"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])

