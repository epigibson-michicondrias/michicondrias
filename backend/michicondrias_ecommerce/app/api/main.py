from fastapi import APIRouter
from app.api.routes import products, donations

api_router = APIRouter()
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(donations.router, prefix="/donations", tags=["donations"])
