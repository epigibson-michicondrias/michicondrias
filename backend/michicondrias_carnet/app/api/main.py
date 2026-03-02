from fastapi import APIRouter
from app.api.routes import records, vaccines

api_router = APIRouter()
api_router.include_router(records.router, prefix="/records", tags=["medical_records"])
api_router.include_router(vaccines.router, prefix="/vaccines", tags=["vaccines"])
