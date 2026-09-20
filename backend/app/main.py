from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import health, audio, analyze

app = FastAPI(
    title="Synthetic Speech Detection API",
    description="Backend API for detecting human and synthetic speech",
    version="1.0.0"
)

# Allow the React frontend to communicate with this backend
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