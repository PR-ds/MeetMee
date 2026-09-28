import httpx
from typing import Optional
from app.config import settings

class BotService:
    def __init__(self):
        self.api_key = settings.RECALL_AI_API_KEY
        self.base_url = settings.RECALL_AI_BASE_URL
        self.bot_name = settings.BOT_NAME

    def detect_platform(self, url: str) -> str:
        url_lower = url.lower()
        if "zoom.us" in url_lower:
            return "zoom"
        elif "meet.google.com" in url_lower:
            return "google_meet"
        elif "teams.microsoft.com" in url_lower or "teams.live.com" in url_lower:
            return "ms_teams"
        return "generic_webrtc"

    async def spawn_bot(self, meeting_url: str, meeting_id: str) -> dict:
        """
        Dispatches an autonomous recording bot to the meeting.
        If Recall.ai API key is not configured, provides a mock session ID
        so local development and simulation works out-of-the-box.
        """
        if not self.api_key:
            # Fallback mock bot for local dev and offline simulation
            return {
                "bot_id": f"mock-bot-{meeting_id[:8]}",
                "status": "ready",
                "is_mock": True
            }

        headers = {
            "Authorization": f"Token {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "meeting_url": meeting_url,
            "bot_name": self.bot_name,
            "transcription_options": {
                "provider": "deepgram"
            },
            "real_time_transcription": {
                "destination_url": f"https://api.meetmee.ai/api/v1/webhooks/bot-audio/{meeting_id}"
            }
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(f"{self.base_url}/bot/", json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            return {
                "bot_id": data.get("id"),
                "status": data.get("status_changes", [{}])[-1].get("code", "joining"),
                "is_mock": False
            }

bot_service = BotService()
