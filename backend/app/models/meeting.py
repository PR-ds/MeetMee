import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), default="Untitled Meeting")
    platform = Column(String(50), nullable=False) # 'zoom', 'google_meet', 'ms_teams'
    meeting_url = Column(Text, nullable=False)
    bot_session_id = Column(String(255), nullable=True) # Recall.ai bot ID
    status = Column(String(50), default="scheduled") # 'scheduled', 'bot_joining', 'in_progress', 'completed', 'failed'
    
    scheduled_start = Column(DateTime, nullable=True)
    actual_start = Column(DateTime, nullable=True)
    actual_end = Column(DateTime, nullable=True)
    raw_audio_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="meetings")
    transcripts = relationship("TranscriptSegment", back_populates="meeting", cascade="all, delete-orphan")
    events = relationship("RealtimeEvent", back_populates="meeting", cascade="all, delete-orphan")
    summary = relationship("MeetingSummary", back_populates="meeting", uselist=False, cascade="all, delete-orphan")
    podcast = relationship("MeetingPodcast", back_populates="meeting", uselist=False, cascade="all, delete-orphan")
    comic = relationship("MeetingComic", back_populates="meeting", uselist=False, cascade="all, delete-orphan")
