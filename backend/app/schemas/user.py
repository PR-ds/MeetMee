from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: Optional[str] = "corporate_employee"
    mother_tongue: Optional[str] = "en"
    subscription_tier: Optional[str] = "free"

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    mother_tongue: Optional[str] = None
    subscription_tier: Optional[str] = None
    meetings_used: Optional[str] = None
    allow_comic: Optional[bool] = None
    allow_podcast: Optional[bool] = None
    allow_native_assistant: Optional[bool] = None

class UserResponse(UserBase):
    id: str
    meetings_used: str = "0"
    allow_comic: bool = False
    allow_podcast: bool = False
    allow_native_assistant: bool = False
    created_at: datetime

    class Config:
        from_attributes = True
