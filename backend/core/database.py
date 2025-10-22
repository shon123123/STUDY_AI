from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import IndexModel, ASCENDING, TEXT
import logging
from .config import get_settings

settings = get_settings()

class Database:
    client: AsyncIOMotorClient = None
    database = None

db = Database()

async def connect_to_mongo():
    """Create database connection"""
    try:
        db.client = AsyncIOMotorClient(
            settings.mongodb_url,
            serverSelectionTimeoutMS=5000  # Fail fast
        )
        db.database = db.client[settings.database_name]
        
        # Test the connection
        await db.client.admin.command('ping')
        
        # Create indexes
        await create_indexes()
        
        logging.info(f"✅ Connected to MongoDB: {settings.database_name}")
        
    except Exception:
        # Simple message instead of verbose error
        raise Exception("MongoDB not available")

async def close_mongo_connection():
    """Close database connection"""
    try:
        if db.client:
            db.client.close()
            logging.info("📝 Disconnected from MongoDB")
    except Exception:
        pass  # Silent close

async def create_indexes():
    """Create database indexes for better performance"""
    try:
        # Users collection indexes
        users_collection = db.database.users
        await users_collection.create_index("email", unique=True)
        await users_collection.create_index("created_at")
        
        # Documents collection indexes
        documents_collection = db.database.documents
        await documents_collection.create_index("upload_date")
        await documents_collection.create_index("processing_status")
        await documents_collection.create_index("filename")
        
        # Study sessions indexes
        sessions_collection = db.database.study_sessions
        await sessions_collection.create_index([("user_id", ASCENDING), ("created_at", -1)])
        await sessions_collection.create_index("is_active")
        
        # Chat history indexes
        chat_collection = db.database.chat_history
        await chat_collection.create_index([("user_id", ASCENDING), ("timestamp", -1)])
        
        # Content collection with text search
        content_collection = db.database.content
        await content_collection.create_index([("title", TEXT), ("content", TEXT)])
        await content_collection.create_index("subject")
        
        # Progress tracking indexes
        progress_collection = db.database.progress
        await progress_collection.create_index([("user_id", ASCENDING), ("subject", ASCENDING)])
        
        logging.info("✅ Database indexes created successfully")
        
    except Exception as e:
        logging.error(f"❌ Failed to create indexes: {str(e)}")
        raise

async def get_database():
    """Get database instance"""
    return db.database
    