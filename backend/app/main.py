from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings

from app.routers.auth import router as auth_router
from app.routers.users import router as user_router
from app.routers.projects import router as project_router

from app.routers import benchmark
from app.routers import results
from app.routers import leaderboard
from app.routers import dashboard
from app.routers import comparison

from app.routers.export import router as export_router
from app.routers import documents
from app.routers import rag


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Routers
# --------------------------------------------------

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(project_router)

app.include_router(benchmark.router)
app.include_router(results.router)

app.include_router(leaderboard.router)
app.include_router(dashboard.router)

app.include_router(comparison.router)

app.include_router(export_router)

app.include_router(documents.router)

app.include_router(rag.router)


# --------------------------------------------------
# Root
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "project": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "Running"
    }


# --------------------------------------------------
# Health Check
# --------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }