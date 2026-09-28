import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ARRAY, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    phonetic_aliases = Column(Text, default="[]") # JSON string or array of nicknames
    mother_tongue = Column(String(10), default="en") # 'en', 'es', 'hi', 'fr', etc.
    role = Column(String(50), default="corporate_employee")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Preferences
    mentor_names = Column(Text, default="[]")
    enable_chime_alert = Column(Boolean, default=True)
    enable_screen_flash = Column(Boolean, default=True)
    enable_qa_popup = Column(Boolean, default=True)
    podcast_voice_pair = Column(String(50), default="conversational_duo_1")
    email_summary_enabled = Column(Boolean, default=True)

    meetings = relationship("Meeting", back_populates="user", cascade="all, delete-orphan")
