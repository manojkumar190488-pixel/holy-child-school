"""
GovIntel AI — FastAPI Application Entry Point
"""

import time
from contextlib import asynccontextmanager
from typing import Callable

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logging_config import logger
from app.core.database import create_all_tables, dispose_engine
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    # --- Startup ---
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")

    # Create DB tables and enable extensions
    try:
        await create_all_tables()
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        # Don't crash — allow app to start if DB is temporarily unavailable

    # Start APScheduler
    if settings.ENVIRONMENT != "test":
        try:
            from app.workers.scheduler import create_scheduler
            scheduler = create_scheduler()
            scheduler.start()
            logger.info("APScheduler started")
        except Exception as e:
            logger.error(f"Scheduler startup error: {e}")

    logger.info(f"{settings.APP_NAME} startup complete")
    yield

    # --- Shutdown ---
    logger.info("Shutting down...")

    # Stop scheduler
    try:
        from app.workers.scheduler import get_scheduler
        sched = get_scheduler()
        if sched and sched.running:
            sched.shutdown(wait=False)
            logger.info("Scheduler stopped")
    except Exception as e:
        logger.warning(f"Scheduler shutdown error: {e}")

    # Dispose DB engine
    await dispose_engine()
    logger.info("Shutdown complete")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "AI-powered Job Opportunity Intelligence Agent for senior consulting professionals. "
        "Scrapes, scores, and surfaces the most relevant opportunities across platforms."
    ),
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
    lifespan=lifespan,
)

# --- Middleware ---

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gzip compression
app.add_middleware(GZipMiddleware, minimum_size=500)


# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next: Callable) -> Response:
    start_time = time.monotonic()
    response = await call_next(request)
    process_time = time.monotonic() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f}"
    return response


# Request ID middleware
@app.middleware("http")
async def add_request_id(request: Request, call_next: Callable) -> Response:
    import uuid
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4())[:8])
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error(
        f"Unhandled exception on {request.method} {request.url.path}: {exc}",
        exc_info=True,
    )
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "path": str(request.url.path),
        },
    )


# --- Routes ---
app.include_router(api_router)


@app.get("/health", tags=["system"])
async def health_check():
    """Health check endpoint for load balancers and monitoring."""
    from app.core.database import engine
    db_ok = False
    try:
        async with engine.connect() as conn:
            from sqlalchemy import text
            await conn.execute(text("SELECT 1"))
        db_ok = True
    except Exception as e:
        logger.warning(f"Health check DB error: {e}")

    return {
        "status": "healthy" if db_ok else "degraded",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "database": "connected" if db_ok else "unavailable",
    }


@app.get("/", tags=["system"])
async def root():
    """API root."""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs" if settings.DEBUG else "disabled in production",
    }


@app.get("/api/v1/admin/trigger-scrape", tags=["admin"])
async def trigger_scrape_now():
    """Manually trigger a scraping run (admin use)."""
    if not settings.DEBUG:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Admin endpoints disabled in production")

    from app.workers.scraping_worker import run_all_scrapers_task
    task = run_all_scrapers_task.delay()
    return {"task_id": task.id, "status": "queued"}
