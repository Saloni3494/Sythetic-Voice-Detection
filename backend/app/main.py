from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import health, audio, analyze

import os

app = FastAPI(
    title="Synthetic Speech Detection API",
    description="Backend API for detecting human and synthetic speech",
    version="1.0.0"
)

# Configure CORS for local development, Vercel deployments, and custom domains
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if allowed_origins_env:
    for origin in allowed_origins_env.split(","):
        cleaned = origin.strip()
        if cleaned and cleaned not in origins:
            origins.append(cleaned)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Synthetic Speech Detection API",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

app.include_router(
    health.router,
    prefix="/api/health",
    tags=["Health"]
)

app.include_router(
    audio.router,
    prefix="/api/audio",
    tags=["Audio"]
)

app.include_router(
    analyze.router,
    prefix="/api",
    tags=["Analyze Audio"]
)