from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    target_role: Optional[str] = "Full Stack Developer"
    experience_level: Optional[str] = "Beginner"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    target_role: Optional[str] = None
    experience_level: Optional[str] = None
    bio: Optional[str] = None
    weekly_study_hours: Optional[int] = 10

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    target_role: Optional[str] = "Full Stack Developer"
    experience_level: Optional[str] = "Beginner"
    bio: Optional[str] = ""
    weekly_study_hours: Optional[int] = 10
    created_at: Optional[datetime] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
