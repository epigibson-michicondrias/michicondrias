from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.main import api_router
from mangum import Mangum
import os
import time
import logging
import uuid
from contextvars import ContextVar

logger = logging.getLogger(__name__)
correlation_id_ctx: ContextVar[str] = ContextVar("correlation_id", default="")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    root_path=os.getenv("PROXY_PREFIX", "")
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://michicondrias.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_process_time_header(request, call_next):
    # Get correlation ID from header (sent by other services) or generate a new one
    correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
    correlation_id_ctx.set(correlation_id)

    start_time = time.perf_counter()
    # Log request start (optional but useful in microservices)
    
    response = await call_next(request)
    process_time = time.perf_counter() - start_time
    
    # Log with correlation ID
    logger.info(
        f"Request {request.method} {request.url.path} - "
        f"CorrID: {correlation_id} - Process time: {process_time:.4f}s"
    )
    
    response.headers["X-Process-Time"] = str(process_time)
    response.headers["X-Correlation-ID"] = correlation_id
    return response


app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "Bienvenido al API de Michicondrias Carnet Medico"}

handler = Mangum(app)

