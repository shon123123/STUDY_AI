"""
Pytest configuration and fixtures for the Study AI backend
"""
import pytest
import asyncio
import os
from typing import AsyncGenerator, Generator
from httpx import AsyncClient
from fastapi.testclient import TestClient
from motor.motor_asyncio import AsyncIOMotorClient

# Import your FastAPI app
import sys
sys.path.append('..')
from main import app

# Test database configuration
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL", 
    "mongodb://admin:password123@localhost:27017/study_ai_test?authSource=admin"
)

@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
def client() -> TestClient:
    """Create a test client for the FastAPI app."""
    return TestClient(app)

@pytest.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """Create an async test client for the FastAPI app."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture(scope="session")
async def test_db():
    """Create a test database connection."""
    client = AsyncIOMotorClient(TEST_DATABASE_URL)
    db = client.study_ai_test
    
    # Clean up before tests
    await client.drop_database("study_ai_test")
    
    yield db
    
    # Clean up after tests
    await client.drop_database("study_ai_test")
    client.close()

@pytest.fixture
async def sample_document():
    """Sample document data for testing."""
    return {
        "filename": "test_document.pdf",
        "content": "This is a sample document content for testing purposes. It contains educational material about Python programming, data structures, and algorithms.",
        "file_type": "application/pdf",
        "file_size": 1024,
        "processed": True,
        "processing_status": "completed"
    }

@pytest.fixture
async def sample_quiz():
    """Sample quiz data for testing."""
    return {
        "title": "Python Basics Quiz",
        "questions": [
            {
                "question": "What is Python?",
                "options": ["A snake", "A programming language", "A tool", "A framework"],
                "correct_answer": 1,
                "explanation": "Python is a high-level programming language."
            },
            {
                "question": "What does 'len()' function do?",
                "options": ["Calculates length", "Creates list", "Deletes item", "Sorts data"],
                "correct_answer": 0,
                "explanation": "len() function returns the length of an object."
            }
        ],
        "difficulty": "medium",
        "subject": "Programming"
    }

@pytest.fixture
async def sample_flashcards():
    """Sample flashcards data for testing."""
    return [
        {
            "front": "What is a variable in Python?",
            "back": "A variable is a named storage location that holds data which can be modified during program execution.",
            "difficulty": 3,
            "topic": "Python Basics"
        },
        {
            "front": "What is a function?",
            "back": "A function is a reusable block of code that performs a specific task and can accept parameters and return values.",
            "difficulty": 2,
            "topic": "Python Functions"
        }
    ]

@pytest.fixture
def auth_headers():
    """Authentication headers for testing protected endpoints."""
    return {
        "Authorization": "Bearer test_token",
        "Content-Type": "application/json"
    }

# Test data cleanup utilities
@pytest.fixture(autouse=True)
async def cleanup_test_data(test_db):
    """Automatically clean up test data after each test."""
    yield
    
    # Clean up collections after each test
    collections = ["documents", "quizzes", "flashcards", "users", "study_sessions"]
    for collection_name in collections:
        await test_db[collection_name].delete_many({})