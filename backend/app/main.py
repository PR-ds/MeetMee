from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.api.v1 import api_v1_router
from app.websockets.connection_manager import ws_manager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables on startup (convenient for local dev & testing)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print(f"MeetMee Backend initialized on {settings.HOST}:{settings.PORT}")
    yield
    await engine.dispose()

app = FastAPI(
    title="MeetMee API",
    description="Backend AI Services and Real-Time Event Hub for MeetMee Meeting Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API
app.include_router(api_v1_router)

# WebSocket Endpoint for Live Meeting HUD (Mentor Q&A & Name Mentions)
@app.websocket("/ws/meetings/{meeting_id}")
async def meeting_websocket_endpoint(websocket: WebSocket, meeting_id: str):
    await ws_manager.connect(meeting_id, websocket)
    try:
        # Send initial confirmation
        await websocket.send_json({
            "type": "CONNECTION_ESTABLISHED",
            "meeting_id": meeting_id,
            "status": "connected",
            "message": "MeetMee Real-Time Event Gateway connected."
        })
        while True:
            # Keep socket open and receive client heartbeats or local speech pings
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(meeting_id, websocket)
    except Exception:
        ws_manager.disconnect(meeting_id, websocket)

@app.get("/health", tags=["System"])
@app.get("/healthz", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": "MeetMee API Gateway",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
