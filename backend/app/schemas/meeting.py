from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime

class MeetingJoinRequest(BaseModel):
    meeting_url: str
    user_id: Optional[str] = "demo-user-id"
    title: Optional[str] = "Live Corporate Meeting"
    mentor_names: Optional[List[str]] = []

class MeetingResponse(BaseModel):
    id: str
    user_id: str
    title: str
    platform: str
    meeting_url: str
    bot_session_id: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class MeetingDetailResponse(MeetingResponse):
    scheduled_start: Optional[datetime]
    actual_start: Optional[datetime]
    actual_end: Optional[datetime]
    raw_audio_url: Optional[str]
