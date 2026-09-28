from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RealtimeEventResponse(BaseModel):
    id: str
    meeting_id: str
    event_type: str
    trigger_text: str
    speaker_name: str
    timestamp_ms: int
    suggested_response: Optional[str]
    confidence: str
    was_displayed: bool
    created_at: datetime

    class Config:
        from_attributes = True

class QuestionAskPayload(BaseModel):
    meeting_id: str
    question: str
    speaker_name: Optional[str] = "Mentor"
