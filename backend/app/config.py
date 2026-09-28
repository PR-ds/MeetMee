import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "*"]

    # Database & Redis
    DATABASE_URL: str = "postgresql+asyncpg://meetmee_user:meetmee_password@localhost:5432/meetmee_db"
    REDIS_URL: str = "redis://localhost:6379/0"

    # Ingestion & Audio Bot
    RECALL_AI_API_KEY: str = ""
    RECALL_AI_BASE_URL: str = "https://api.recall.ai/api/v1"
    BOT_NAME: str = "MeetMee AI Assistant"

    # Streaming ASR
    DEEPGRAM_API_KEY: str = ""

    # Google Gemini LLM
    GEMINI_API_KEY: str = ""

    # ElevenLabs TTS
    ELEVENLABS_API_KEY: str = ""
    ELEVENLABS_HOST_A_VOICE_ID: str = "21m00Tcm4TlvDq8ikWAM" # Rachel
    ELEVENLABS_HOST_B_VOICE_ID: str = "pNInz6obpgDQGcFmaJgB" # Adam

    # Resend Email
    RESEND_API_KEY: str = ""
    FROM_EMAIL: str = "MeetMee <notes@meetmee.ai>"

    # Image Gen for Comics
    FAL_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
