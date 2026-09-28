import os
import google.generativeai as genai
from typing import List, Dict, Optional
from app.config import settings

class QAEngine:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        if self.api_key:
            genai.configure(api_key=self.api_key)

    async def answer_question_from_context(
        self,
        question: str,
        recent_transcript_segments: List[Dict],
        speaker_name: str = "Mentor"
    ) -> Dict:
        """
        Uses Gemini 1.5 Flash to synthesize a fast, grounded answer from recent meeting dialogue.
        Falls back to intelligent local context extraction if API key is not yet set.
        """
        context_text = "\n".join([
            f"[{seg.get('speaker_name', 'Speaker')}] ({seg.get('start_time_ms', 0)//1000}s): {seg.get('text', '')}"
            for seg in recent_transcript_segments[-20:] # Last 20 segments
        ])

        if not self.api_key:
            # Fallback heuristic context answer for offline dev/demo
            matching_lines = [
                seg for seg in recent_transcript_segments
                if any(w.lower() in seg.get('text', '').lower() for w in question.split() if len(w) > 4)
            ]
            if matching_lines:
                best = matching_lines[-1]
                return {
                    "answer": f"Based on {best.get('speaker_name', 'earlier speaker')}'s comments: '{best.get('text')}'",
                    "citation": f"Discussed around {best.get('start_time_ms', 0)//1000}s by {best.get('speaker_name')}",
                    "confidence": "high"
                }
            return {
                "answer": f"Context for '{question}' was not explicitly stated in recent segments. Listening for updates.",
                "citation": "Meeting context",
                "confidence": "medium"
            }

        prompt = f"""
You are MeetMee, an ultra-fast context-aware assistant for a corporate employee or student.
A meeting host/mentor ({speaker_name}) just asked the following question:
"{question}"

Here is the recent transcript from this meeting:
---
{context_text}
---

Your task:
1. Provide a direct, factual 1-to-2 sentence answer to the question strictly based on the transcript above.
2. Provide the exact speaker citation and timestamp.
3. If the transcript does not contain the answer, say "Not explicitly mentioned in meeting transcript yet."

Format strictly as:
ANSWER: <your 1-2 sentence answer>
CITATION: <Speaker name and time>
"""
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = await model.generate_content_async(prompt)
            lines = response.text.strip().split("\n")
            ans = ""
            citation = "Meeting discussion"
            for line in lines:
                if line.startswith("ANSWER:"):
                    ans = line.replace("ANSWER:", "").strip()
                elif line.startswith("CITATION:"):
                    citation = line.replace("CITATION:", "").strip()
            if not ans:
                ans = response.text.strip()

            return {
                "answer": ans,
                "citation": citation,
                "confidence": "high"
            }
        except Exception as e:
            return {
                "answer": f"Error synthesizing answer: {str(e)}",
                "citation": "Error",
                "confidence": "low"
            }

qa_engine = QAEngine()
