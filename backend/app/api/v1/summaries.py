from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict

from app.database import get_db
from app.models.meeting import Meeting
from app.models.transcript import TranscriptSegment
from app.services.summary_engine import summary_engine
from app.services.email_service import email_service

router = APIRouter(prefix="/summaries", tags=["Summaries"])

@router.get("/{meeting_id}")
async def get_summary(meeting_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Meeting).where(Meeting.id == meeting_id))
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    t_res = await db.execute(
        select(TranscriptSegment)
        .where(TranscriptSegment.meeting_id == meeting_id)
        .order_by(TranscriptSegment.start_time_ms.asc())
    )
    segments = [
        {"speaker_name": s.speaker_name, "text": s.text}
        for s in t_res.scalars().all()
    ]

    summary = await summary_engine.generate_hint_summary(segments, meeting.title)
    return summary

@router.post("/{meeting_id}/send-email")
async def email_summary(meeting_id: str, email: str = "developer@example.com", db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Meeting).where(Meeting.id == meeting_id))
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    t_res = await db.execute(select(TranscriptSegment).where(TranscriptSegment.meeting_id == meeting_id))
    segments = [{"speaker_name": s.speaker_name, "text": s.text} for s in t_res.scalars().all()]
    summary = await summary_engine.generate_hint_summary(segments, meeting.title)

    success = await email_service.send_summary_email(email, meeting.title, summary)
    return {"delivered": success, "recipient": email}
