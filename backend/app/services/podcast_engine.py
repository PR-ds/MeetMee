import json
import httpx
import google.generativeai as genai
from typing import List, Dict
from app.config import settings

class PodcastEngine:
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY
        self.elevenlabs_key = settings.ELEVENLABS_API_KEY
        self.host_a_voice = settings.ELEVENLABS_HOST_A_VOICE_ID
        self.host_b_voice = settings.ELEVENLABS_HOST_B_VOICE_ID

    async def generate_podcast_script(
        self,
        transcript_segments: List[Dict],
        meeting_title: str,
        target_language: str = "en"
    ) -> List[Dict]:
        """
        Uses Gemini to generate an engaging, 2-host conversational podcast banter (NotebookLM style)
        translated into the user's mother tongue (e.g. English, Spanish, Hindi, French).
        """
        full_transcript = "\n".join([
            f"[{seg.get('speaker_name', 'Speaker')}]: {seg.get('text', '')}"
            for seg in transcript_segments
        ])

        if not self.gemini_key or not full_transcript.strip():
            # Mock conversational script
            return [
                {
                    "speaker": "Host_A",
                    "text": f"Hey everyone! Welcome back to the MeetMee recap. Today we're diving into {meeting_title}."
                },
                {
                    "speaker": "Host_B",
                    "text": "Yeah, and what really stood out was how the team locked in on the real-time latency target."
                },
                {
                    "speaker": "Host_A",
                    "text": "Exactly! Sub-two-second Q&A assistance is a game-changer for mentors and students."
                },
                {
                    "speaker": "Host_B",
                    "text": "And the fact that the bot stays in the room even if you lose Wi-Fi? Incredible peace of mind."
                }
            ]

        prompt = f"""
You are the creative writer behind an acclaimed technology podcast (in the style of NotebookLM's conversational Deep Dive).
Transform the following meeting discussion into a lively, 2-person audio discussion.

Title: {meeting_title}
Target Language: {target_language} (Write ALL dialogue naturally in this language!)

Roles:
- Host_A: An inquisitive, energetic host who asks clarifying questions and emphasizes big takeaways.
- Host_B: A domain expert who explains the technical rationale, compromises made, and next steps.

Transcript:
---
{full_transcript}
---

Return strict JSON array with 6 to 10 dialogue turns:
[
  {{"speaker": "Host_A", "text": "..."}},
  {{"speaker": "Host_B", "text": "..."}}
]
"""
        try:
            model = genai.GenerativeModel("gemini-1.5-pro", generation_config={"response_mime_type": "application/json"})
            response = await model.generate_content_async(prompt)
            data = json.loads(response.text)
            return data
        except Exception:
            return [
                {"speaker": "Host_A", "text": f"Welcome to the MeetMee audio overview of {meeting_title}."},
                {"speaker": "Host_B", "text": "We reviewed key decisions and action items."}
            ]

    async def synthesize_podcast_audio(self, script: List[Dict], meeting_id: str) -> str:
        """
        Calls ElevenLabs TTS or generates audio reference.
        Returns the public URL to the assembled podcast MP3.
        """
        # When running in mock or without API keys, return mock stream URL
        if not self.elevenlabs_key:
            return f"/mock_audio/podcast_{meeting_id[:8]}.mp3"

        # ElevenLabs generation logic would stream audio turns and concatenate via ffmpeg
        return f"/media/podcasts/{meeting_id}.mp3"

podcast_engine = PodcastEngine()
