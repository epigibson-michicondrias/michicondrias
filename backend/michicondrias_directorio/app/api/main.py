from fastapi import APIRouter
from app.api.routes import clinics, veterinarians, reviews, services_routes, schedule_routes, appointments_routes, medical_routes

api_router = APIRouter()
api_router.include_router(clinics.router, prefix="/clinics", tags=["clinics"])
api_router.include_router(veterinarians.router, prefix="/veterinarians", tags=["veterinarians"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(services_routes.router, prefix="/catalog", tags=["services"])
api_router.include_router(schedule_routes.router, prefix="/schedule", tags=["schedule"])
api_router.include_router(appointments_routes.router, prefix="/appointments", tags=["appointments"])
api_router.include_router(medical_routes.router, prefix="/medical-records", tags=["medical_records"])


