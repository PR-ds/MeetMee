from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.meeting import Meeting
from app.models.transcript import TranscriptSegment
from app.services.comic_engine import comic_engine

router = APIRouter(prefix="/comics", tags=["Visual Comics"])

@router.get("/{meeting_id}")
async def get_or_generate_comic(meeting_id: str, db: AsyncSession = Depends(get_db)):
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

    panels = await comic_engine.generate_comic_storyboard(segments, meeting.title)
    return {
        "meeting_id": meeting_id,
        "title": meeting.title,
        "panel_count": len(panels),
        "panels": panels,
        "composite_image_url": f"/mock_media/comic_{meeting_id[:8]}.png"
    }
