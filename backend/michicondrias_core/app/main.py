from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.main import api_router
from mangum import Mangum
from fastapi.staticfiles import StaticFiles
import os

# Michicondrias Core Service - Ready for AWS Lambda
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    root_path=os.getenv("PROXY_PREFIX", "")
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "https://michicondrias.vercel.app",
        "https://michicondrias-frontend.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "Bienvenido al API de Michicondrias"}

handler = Mangum(app)

