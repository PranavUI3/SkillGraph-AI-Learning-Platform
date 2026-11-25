import logging
from pymongo import MongoClient, ASCENDING
from pymongo.database import Database
from app.core.config import settings

logger = logging.getLogger("skillgraph.db")

_client: MongoClient | None = None
_db: Database | None = None

def get_mongo_client() -> MongoClient:
    global _client
    if _client is None:
        try:
            _client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=5000)
            # Test connection
            _client.admin.command('ping')
            logger.info("Successfully connected to MongoDB.")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise e
    return _client

def get_database() -> Database:
    global _db
    if _db is None:
        client = get_mongo_client()
        _db = client[settings.DATABASE_NAME]
        init_db_indexes(_db)
    return _db

def init_db_indexes(db: Database):
    """Ensure essential indexes exist for performance and uniqueness."""
    try:
        # Users
        db["users"].create_index([("email", ASCENDING)], unique=True)
        # Skills
        db["skills"].create_index([("user_id", ASCENDING)])
        # Assessments
        db["assessments"].create_index([("user_id", ASCENDING), ("created_at", ASCENDING)])
        # Roadmaps
        db["roadmaps"].create_index([("user_id", ASCENDING), ("created_at", ASCENDING)])
        # Tutor Conversations
        db["tutor_conversations"].create_index([("user_id", ASCENDING), ("conversation_id", ASCENDING)], unique=True)
        db["tutor_conversations"].create_index([("user_id", ASCENDING), ("updated_at", ASCENDING)])
        # Quiz Attempts
        db["quiz_attempts"].create_index([("user_id", ASCENDING), ("created_at", ASCENDING)])
        logger.info("MongoDB collections and indexes initialized successfully.")
    except Exception as e:
        logger.warning(f"Could not initialize all MongoDB indexes: {e}")

def close_mongo_connection():
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
        logger.info("MongoDB connection closed.")
