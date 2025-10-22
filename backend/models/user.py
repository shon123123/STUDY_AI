# User model for authentication (simplified for demo)

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    """User roles"""
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"

class UserStatus(str, Enum):
    """User account status"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class User(BaseModel):
    """User model"""
    id: str = Field(..., description="Unique user identifier")
    email: str = Field(..., description="User email address")
    username: str = Field(..., description="Username")
    full_name: Optional[str] = Field(None, description="Full name")
    role: UserRole = Field(UserRole.STUDENT, description="User role")
    status: UserStatus = Field(UserStatus.ACTIVE, description="Account status")
    created_at: datetime = Field(..., description="Account creation time")
    last_login: Optional[datetime] = Field(None, description="Last login time")
    preferences: Optional[Dict[str, Any]] = Field(None, description="User preferences")

# Simplified auth dependency (for demo purposes)
async def get_current_user() -> User:
    """Get current authenticated user (mock implementation)"""
    return User(
        id="demo_user_123",
        email="demo@example.com",
        username="demo_user",
        full_name="Demo User",
        role=UserRole.STUDENT,
        status=UserStatus.ACTIVE,
        created_at=datetime.utcnow()
    )
