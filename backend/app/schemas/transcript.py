from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TranscriptSegmentCreate(BaseModel):
    meeting_id: str
    speaker_index: int
    speaker_name: str
    text: str
    start_time_ms: int
    end_time_ms: int
    confidence: float = 1.0

class TranscriptSegmentResponse(TranscriptSegmentCreate):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class SearchTranscriptQuery(BaseModel):
    query: str
    limit: int = 5
