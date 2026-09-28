import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from backend.config import ENVIRONMENT, HOST, PORT, IS_DEMO_AI_MODE, GEMINI_API_KEY
from backend.database.db import Base, engine, SessionLocal
from backend.api import api_router
from backend.utils.seeder import seed_database
from backend.services.ai_service import ai_service
from backend.services.memory_service import memory_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check and auto-seed 500+ realistic records on initial launch
        await seed_database(db, force=False)
    except Exception as e:
        print(f"[AETHER] Seeder notice: {e}")
    finally:
        db.close()
    yield

app = FastAPI(
    title="AETHER — AI Feedback Memory Agent",
    description="From scattered feedback to connected memory and emerging product insights.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AETHER Feedback Memory Agent",
        "mode": "Demo AI Mode" if ai_service.is_demo_mode else "Gemini Live AI",
        "vector_memory_items": len(memory_service.vectors)
    }

@app.get("/api/system/status")
def system_status():
    return {
        "is_demo_mode": ai_service.is_demo_mode,
        "has_gemini_key": bool(GEMINI_API_KEY),
        "vector_store_count": len(memory_service.vectors),
        "app_title": "AETHER — AI Feedback Memory Agent",
        "tagline": "From scattered feedback to connected memory and emerging product insights."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=HOST, port=PORT, reload=(ENVIRONMENT == "development"))
