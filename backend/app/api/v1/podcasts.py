from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.meeting import Meeting
from app.models.transcript import TranscriptSegment
from app.services.podcast_engine import podcast_engine

router = APIRouter(prefix="/podcasts", tags=["Podcasts"])

@router.get("/{meeting_id}")
async def get_or_generate_podcast(
    meeting_id: str,
    language: str = Query("en", description="Target mother tongue code (e.g. en, es, hi, fr)"),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Meeting).where(Meeting.id == meeting_id))
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    t_res = await db.execute(
        select(TranscriptSegment)
        .where(TranscriptSegment.meeting_id == meeting_id)
        .order_by(TranscriptSegment.start_time_ms.asc())
    )
    segments = [{"speaker_name": s.speaker_name, "text": s.text} for s in t_res.scalars().all()]

    script = await podcast_engine.generate_podcast_script(segments, meeting.title, language)
    audio_url = await podcast_engine.synthesize_podcast_audio(script, meeting_id)

    return {
        "meeting_id": meeting_id,
        "language": language,
        "script": script,
        "audio_url": audio_url,
        "duration_seconds": len(script) * 12
    }
