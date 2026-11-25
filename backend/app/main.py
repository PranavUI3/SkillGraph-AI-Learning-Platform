import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.connection import get_database, close_mongo_connection
from app.routes import auth, skills, roadmap, tutor, quiz, dashboard

# Configure logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("skillgraph.api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure database connection
    logger.info("Starting up SkillGraph API...")
    try:
        get_database()
        logger.info("Connected to MongoDB successfully.")
    except Exception as e:
        logger.error(f"Error connecting to MongoDB during startup: {e}")
    yield
    # Shutdown
    logger.info("Shutting down SkillGraph API...")
    close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SkillGraph AI-Powered Personalized Learning Platform REST API",
    lifespan=lifespan
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(skills.router)
app.include_router(roadmap.router)
app.include_router(tutor.router)
app.include_router(quiz.router)
app.include_router(dashboard.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SkillGraph Backend",
        "version": settings.VERSION,
        "database": "connected"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
