import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class MeetingSummary(Base):
    __tablename__ = "meeting_summaries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), unique=True, nullable=False)
    tldr_json = Column(Text, nullable=False) # JSON array of 3 bullet points
    hint_notes_json = Column(Text, nullable=False) # Structured concept anchors
    action_items_json = Column(Text, nullable=False) # Task / Owner / Deadline matrix
    email_sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    meeting = relationship("Meeting", back_populates="summary")

class MeetingPodcast(Base):
    __tablename__ = "meeting_podcasts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), unique=True, nullable=False)
    language_code = Column(String(10), default="en")
    dialogue_script_json = Column(Text, nullable=False) # 2-host conversational script
    audio_file_url = Column(Text, nullable=False) # URL to mp3 file
    duration_seconds = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    meeting = relationship("Meeting", back_populates="podcast")

class MeetingComic(Base):
    __tablename__ = "meeting_comics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), unique=True, nullable=False)
    panel_count = Column(Integer, default=4)
    panels_json = Column(Text, nullable=False) # [{panel_num, caption, dialogue, character}]
    image_url = Column(Text, nullable=False) # URL to composited comic strip image
    created_at = Column(DateTime, default=datetime.utcnow)

    meeting = relationship("Meeting", back_populates="comic")
