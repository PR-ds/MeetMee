import json
import google.generativeai as genai
from typing import List, Dict
from app.config import settings

class ComicEngine:
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY
        self.fal_key = settings.FAL_KEY

    async def generate_comic_storyboard(self, transcript_segments: List[Dict], meeting_title: str) -> List[Dict]:
        """
        Deconstructs meeting transcript into a 4-panel comic narrative arc:
        Panel 1: The Challenge / Dilemma
        Panel 2: The Brainstorming / Debate
        Panel 3: The Breakthrough / Decision
        Panel 4: The Path Forward / Victory
        """
        full_transcript = "\n".join([
            f"[{seg.get('speaker_name', 'Speaker')}]: {seg.get('text', '')}"
            for seg in transcript_segments
        ])

        if not self.gemini_key or not full_transcript.strip():
            return [
                {
                    "panel_num": 1,
                    "caption": "The Crisis Looming",
                    "character": "Lead Developer",
                    "dialogue": "We're dropping connections whenever clients lose Wi-Fi!",
                    "prompt_visual": "Vector art: stressed software developer staring at multiple error screens in a modern tech office."
                },
                {
                    "panel_num": 2,
                    "caption": "The Brainstorming Battle",
                    "character": "Architect",
                    "dialogue": "What if our bot lives on independent server nodes and keeps transcribing regardless?",
                    "prompt_visual": "Vector art: two tech team members debating energetically at a whiteboard filled with cloud architectures."
                },
                {
                    "panel_num": 3,
                    "caption": "The Breakthrough",
                    "character": "Tech Lead",
                    "dialogue": "Sub-two-second latency achieved! The mentor Q&A HUD is live!",
                    "prompt_visual": "Vector art: glowing green terminal displaying low latency metrics with celebrating engineers."
                },
                {
                    "panel_num": 4,
                    "caption": "The Victorious Future",
                    "character": "Host & User",
                    "dialogue": "MeetMee handles the notes, the podcast, and the answers. Let's ship it!",
                    "prompt_visual": "Vector art: smiling professionals holding coffee cups with futuristic glowing AI assistant holograms."
                }
            ]

        prompt = f"""
Transform the key narrative of this meeting into a 4-panel visual comic strip storyboard.
Title: {meeting_title}
Transcript:
---
{full_transcript}
---

Return strict JSON array with 4 panels:
[
  {{
    "panel_num": 1,
    "caption": "The Challenge",
    "character": "Speaker Name",
    "dialogue": "Short, punchy quote",
    "prompt_visual": "Visual description for image generator in modern vector comic book style"
  }}
]
"""
        try:
            model = genai.GenerativeModel("gemini-1.5-flash", generation_config={"response_mime_type": "application/json"})
            response = await model.generate_content_async(prompt)
            data = json.loads(response.text)
            return data
        except Exception:
            return []

comic_engine = ComicEngine()
