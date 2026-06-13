from fastapi import APIRouter
from app.api.routes import (
    clinics, veterinarians, reviews, services_routes, schedule_routes, 
    appointments_routes, surgeries_routes, metrics_routes, patients_routes, 
    alerts_routes, inventory_routes, laboratory_routes, prescriptions_routes
)

api_router = APIRouter()
api_router.include_router(clinics.router, prefix="/clinics", tags=["clinics"])
api_router.include_router(veterinarians.router, prefix="/veterinarians", tags=["veterinarians"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(services_routes.router, prefix="/catalog", tags=["services"])
api_router.include_router(schedule_routes.router, prefix="/schedule", tags=["schedule"])
api_router.include_router(appointments_routes.router, prefix="/appointments", tags=["appointments"])

# Dashboard & Advanced Clinic Features
api_router.include_router(metrics_routes.router, prefix="/clinics", tags=["metrics"])
api_router.include_router(patients_routes.router, prefix="/clinics", tags=["patients"])
api_router.include_router(alerts_routes.router, prefix="/clinics", tags=["alerts"])
api_router.include_router(surgeries_routes.router, prefix="/clinics/{clinic_id}/surgeries", tags=["surgeries"])
api_router.include_router(inventory_routes.router, prefix="/clinics/{clinic_id}/inventory", tags=["inventory"])
api_router.include_router(laboratory_routes.router, prefix="/clinics/{clinic_id}/laboratory", tags=["laboratory"])
api_router.include_router(prescriptions_routes.router, prefix="/clinics/{clinic_id}/prescriptions", tags=["prescriptions"])

