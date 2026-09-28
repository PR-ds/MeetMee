"""
MeetMee Autonomous In-House Meeting Bot Service
Replaced external Recall.ai dependency with MeetMee's proprietary headless Chromium bot engine.
"""

from app.services.native_bot_engine import native_bot_engine, NativeBotEngine

# Export in-house bot engine as bot_service
bot_service = native_bot_engine
