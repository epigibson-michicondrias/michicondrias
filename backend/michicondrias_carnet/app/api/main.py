from fastapi import APIRouter
from app.api.routes import records, vaccines, reminders

api_router = APIRouter()
api_router.include_router(records.router, prefix="/records", tags=["medical_records"])
api_router.include_router(vaccines.router, prefix="/vaccines", tags=["vaccines"])
api_router.include_router(reminders.router, prefix="/reminders", tags=["reminders"])

