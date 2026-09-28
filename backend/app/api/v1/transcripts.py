from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models.transcript import TranscriptSegment
from app.schemas.transcript import TranscriptSegmentResponse, TranscriptSegmentCreate

router = APIRouter(prefix="/transcripts", tags=["Transcripts"])

@router.get("/{meeting_id}", response_model=List[TranscriptSegmentResponse])
async def get_meeting_transcripts(meeting_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(TranscriptSegment)
        .where(TranscriptSegment.meeting_id == meeting_id)
        .order_by(TranscriptSegment.start_time_ms.asc())
    )
    return result.scalars().all()

@router.post("/", response_model=TranscriptSegmentResponse)
async def append_transcript_segment(
    payload: TranscriptSegmentCreate,
    db: AsyncSession = Depends(get_db)
):
    segment = TranscriptSegment(
        meeting_id=payload.meeting_id,
        speaker_index=payload.speaker_index,
        speaker_name=payload.speaker_name,
        text=payload.text,
        start_time_ms=payload.start_time_ms,
        end_time_ms=payload.end_time_ms,
        confidence=payload.confidence
    )
    db.add(segment)
    await db.commit()
    await db.refresh(segment)
    return segment
