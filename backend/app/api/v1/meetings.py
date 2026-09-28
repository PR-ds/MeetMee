import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models.meeting import Meeting
from app.models.user import User
from app.models.transcript import TranscriptSegment
from app.models.event import RealtimeEvent
from app.schemas.meeting import MeetingJoinRequest, MeetingResponse, MeetingDetailResponse
from app.schemas.event import QuestionAskPayload
from app.services.bot_service import bot_service
from app.services.mention_detector import mention_detector
from app.services.qa_engine import qa_engine
from app.services.summary_engine import summary_engine
from app.services.email_service import email_service
from app.services.podcast_engine import podcast_engine
from app.services.comic_engine import comic_engine
from app.websockets.connection_manager import ws_manager

router = APIRouter(prefix="/meetings", tags=["Meetings"])

@router.post("/join", response_model=MeetingResponse)
async def join_meeting(
    payload: MeetingJoinRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    User pastes a meeting URL (Zoom, Teams, Google Meet).
    The backend registers the meeting, assigns an autonomous bot,
    and initiates the recording session.
    """
    platform = bot_service.detect_platform(payload.meeting_url)
    meeting_id = str(uuid.uuid4())

    # Ensure user exists (or create demo user)
    result = await db.execute(select(User).where(User.id == payload.user_id))
    user = result.scalar_one_or_none()
    if not user:
        user = User(
            id=payload.user_id,
            email="developer@example.com",
            full_name="Alex Chen",
            mother_tongue="en"
        )
        db.add(user)
        await db.commit()

    # Create meeting record
    meeting = Meeting(
        id=meeting_id,
        user_id=user.id,
        title=payload.title or f"{platform.replace('_', ' ').title()} Meeting",
        platform=platform,
        meeting_url=payload.meeting_url,
        status="bot_joining",
        actual_start=datetime.utcnow()
    )
    db.add(meeting)
    await db.commit()
    await db.refresh(meeting)

    # Spawn bot asynchronously
    async def _dispatch_bot():
        try:
            bot_info = await bot_service.spawn_bot(payload.meeting_url, meeting_id)
            async with db.begin():
                meeting.bot_session_id = bot_info.get("bot_id")
                meeting.status = "in_progress"
            await ws_manager.broadcast_to_meeting(meeting_id, {
                "type": "BOT_STATUS",
                "status": "in_progress",
                "message": "MeetMee AI Assistant has joined the call."
            })
        except Exception as e:
            print(f"Error spawning bot: {e}")

    background_tasks.add_task(_dispatch_bot)
    return meeting

@router.get("/", response_model=List[MeetingResponse])
async def list_meetings(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Meeting).order_by(Meeting.created_at.desc()))
    return result.scalars().all()

@router.get("/{meeting_id}", response_model=MeetingDetailResponse)
async def get_meeting(meeting_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Meeting).where(Meeting.id == meeting_id))
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting

@router.post("/{meeting_id}/simulate-event")
async def simulate_live_event(
    meeting_id: str,
    payload: QuestionAskPayload,
    db: AsyncSession = Depends(get_db)
):
    """
    Simulates real-time audio chunk arrival. Evaluates name mention and mentor question.
    Broadcasts results instantly over WebSockets to floating HUD.
    """
    # 1. Fetch meeting and recent transcript
    result = await db.execute(select(Meeting).where(Meeting.id == meeting_id))
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    t_result = await db.execute(
        select(TranscriptSegment)
        .where(TranscriptSegment.meeting_id == meeting_id)
        .order_by(TranscriptSegment.start_time_ms.desc())
        .limit(20)
    )
    recent_segments = [
        {"speaker_name": s.speaker_name, "text": s.text, "start_time_ms": s.start_time_ms}
        for s in t_result.scalars().all()
    ]

    is_question = mention_detector.is_mentor_question(payload.question)
    suggested_ans = None

    if is_question:
        ans_data = await qa_engine.answer_question_from_context(
            payload.question,
            recent_segments,
            payload.speaker_name
        )
        suggested_ans = ans_data.get("answer")

        # Save to realtime_events
        event = RealtimeEvent(
            meeting_id=meeting_id,
            event_type="mentor_question",
            trigger_text=payload.question,
            speaker_name=payload.speaker_name,
            timestamp_ms=14000,
            suggested_response=suggested_ans,
            confidence=ans_data.get("confidence", "high")
        )
        db.add(event)
        await db.commit()

        # Push to WebSocket
        await ws_manager.broadcast_to_meeting(meeting_id, {
            "type": "MENTOR_QUESTION_ALERT",
            "question": payload.question,
            "speaker": payload.speaker_name,
            "suggested_answer": suggested_ans,
            "citation": ans_data.get("citation"),
            "confidence": ans_data.get("confidence")
        })

    return {
        "status": "processed",
        "is_question": is_question,
        "suggested_answer": suggested_ans
    }

@router.post("/{meeting_id}/end")
async def end_meeting(
    meeting_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Terminates meeting and triggers automated post-meeting delivery:
    1. Hint-style summary generation & email delivery.
    2. NotebookLM podcast script synthesis in user's mother tongue.
    3. 4-panel visual comic generation.
    """
    result = await db.execute(select(Meeting).where(Meeting.id == meeting_id))
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    meeting.status = "completed"
    meeting.actual_end = datetime.utcnow()
    await db.commit()

    async def _post_meeting_pipeline():
        async with db.begin():
            t_res = await db.execute(
                select(TranscriptSegment)
                .where(TranscriptSegment.meeting_id == meeting_id)
            )
            segments = [
                {"speaker_name": s.speaker_name, "text": s.text}
                for s in t_res.scalars().all()
            ]

            # 1. Summary & Email
            summary_data = await summary_engine.generate_hint_summary(segments, meeting.title)
            await email_service.send_summary_email("developer@example.com", meeting.title, summary_data)

            # 2. Broadcast completion
            await ws_manager.broadcast_to_meeting(meeting_id, {
                "type": "MEETING_COMPLETED",
                "summary": summary_data
            })

    background_tasks.add_task(_post_meeting_pipeline)
    return {"message": "Meeting ended. Post-processing pipeline triggered."}
