from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.main import api_router
from mangum import Mangum
import os
import time
import logging
import uuid
import traceback
from contextvars import ContextVar
from fastapi import Request, Response

# Configure logging for CloudWatch
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    force=True
)
logger = logging.getLogger("michicondrias")
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
async def observability_middleware(request: Request, call_next):
    correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
    correlation_id_ctx.set(correlation_id)

    start_time = time.perf_counter()
    try:
        response = await call_next(request)
        process_time = time.perf_counter() - start_time

        logger.info(
            f"Request {request.method} {request.url.path} - HTTP {response.status_code} - "
            f"CorrID: {correlation_id} - Time: {process_time:.4f}s"
        )

        response.headers["X-Process-Time"] = str(process_time)
        response.headers["X-Correlation-ID"] = correlation_id
        return response
    except Exception as e:
        process_time = time.perf_counter() - start_time
        logger.error(
            f"EXCEPTION {request.method} {request.url.path} - CorrID: {correlation_id} - "
            f"Error: {type(e).__name__}: {str(e)}\n{traceback.format_exc()}"
        )
        return Response(
            content='{"detail": "Internal Server Error", "correlation_id": "'+correlation_id+'"}',
            status_code=500,
            media_type="application/json",
            headers={"X-Correlation-ID": correlation_id}
        )


app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {"message": "Bienvenido al API de Michicondrias Cuidadores 🏠"}

handler = Mangum(app)
