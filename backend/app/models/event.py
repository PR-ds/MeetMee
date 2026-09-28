import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class RealtimeEvent(Base):
    __tablename__ = "realtime_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False) # 'name_mention', 'mentor_question', 'action_item'
    trigger_text = Column(Text, nullable=False)
    speaker_name = Column(String(255), default="Unknown")
    timestamp_ms = Column(Integer, nullable=False)
    suggested_response = Column(Text, nullable=True) # Answer synthesized for Q&A HUD
    confidence = Column(String(20), default="high")
    was_displayed = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    meeting = relationship("Meeting", back_populates="events")
