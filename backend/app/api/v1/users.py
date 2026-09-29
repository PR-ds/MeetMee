import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.models.meeting import Meeting
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.schemas.meeting import MeetingResponse

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("", response_model=UserResponse)
async def create_user(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    """Create a new user profile for multi-tenant isolation."""
    result = await db.execute(select(User).where(User.email == payload.email))
    existing = result.scalar_one_or_none()
    if existing:
        return existing

    user = User(
        id=f"usr-{uuid.uuid4().hex[:12]}",
        email=payload.email,
        full_name=payload.full_name,
        role=payload.role or "corporate_employee",
        mother_tongue=payload.mother_tongue or "en",
        subscription_tier=payload.subscription_tier or "free",
        meetings_used="0",
        allow_comic=(payload.subscription_tier in ["monthly", "yearly"]),
        allow_podcast=(payload.subscription_tier == "yearly"),
        allow_native_assistant=(payload.subscription_tier == "yearly"),
        created_at=datetime.utcnow()
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.get("", response_model=List[UserResponse])
async def list_users(db: AsyncSession = Depends(get_db)):
    """List all registered users."""
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return result.scalars().all()

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, db: AsyncSession = Depends(get_db)):
    """Get single user profile by ID."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.patch("/{user_id}/subscription", response_model=UserResponse)
async def update_user_subscription(
    user_id: str,
    tier: str, # 'free', 'monthly', 'yearly'
    db: AsyncSession = Depends(get_db)
):
    """Upgrade or switch user subscription tier."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.subscription_tier = tier
    user.allow_comic = tier in ["monthly", "yearly"]
    user.allow_podcast = tier == "yearly"
    user.allow_native_assistant = tier == "yearly"
    
    await db.commit()
    await db.refresh(user)
    return user

@router.get("/{user_id}/meetings", response_model=List[MeetingResponse])
async def get_user_meetings(user_id: str, db: AsyncSession = Depends(get_db)):
    """Get meetings isolated to a specific user."""
    result = await db.execute(
        select(Meeting).where(Meeting.user_id == user_id).order_by(Meeting.created_at.desc())
    )
    return result.scalars().all()
