# 🎙️ MeetMee — AI Corporate Meeting Intelligence & Content Transformation

[![Repository](https://img.shields.io/badge/GitHub-PR--ds%2FMeetMee-181717?logo=github)](https://github.com/PR-ds/MeetMee.git)
[![Backend](https://img.shields.io/badge/FastAPI-Python_3.12-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Frontend](https://img.shields.io/badge/Next.js-15_React_19-000000?logo=next.js)](https://nextjs.org)
[![ASR](https://img.shields.io/badge/Deepgram-Nova--2-13EF93)](https://deepgram.com)
[![LLM](https://img.shields.io/badge/Google-Gemini_1.5_Pro_/_Flash-4285F4?logo=google)](https://ai.google.dev)
[![TTS](https://img.shields.io/badge/ElevenLabs-Multilingual_v2-black)](https://elevenlabs.io)

> **MeetMee** is an enterprise-grade corporate meeting intelligence platform for employees, students, and staff. MeetMee attends meetings autonomously (even if your computer is offline), detects when you are directly addressed, gives you instant context-aware answers to mentor questions, emails hint-style summaries immediately post-meeting, and transforms passive transcripts into **conversational podcasts in your mother tongue** and **visual comic strips**.

---

## 🌟 Core Platform Capabilities

1. 🤖 **Autonomous Meeting Attendance & Offline Transcription**:
   - Paste any Zoom, Google Meet, or Microsoft Teams link.
   - An autonomous bot (`MeetMee AI Assistant`) joins, records, and streams audio directly to cloud ingestion.
   - **Offline Resilience**: Even if your laptop sleeps or your Wi-Fi disconnects, MeetMee continues recording and transcribing in the cloud.

2. ⚡ **Real-Time Name & Mentor Mention Alerts**:
   - Phonetic and direct-address detection alerts you instantly when a host or mentor calls your name.
   - Triggers non-intrusive sound chimes and visual perimeter screen pulses.

3. 💡 **Context-Aware Q&A Pop-up HUD**:
   - When a mentor asks a question, MeetMee scans the meeting's prior discussion in real-time and streams a concise, 2-bullet suggested answer with timestamp citations in $< 1.8$ seconds.

4. 📧 **Post-Meeting Hint-Style Summaries via Email**:
   - Automatically synthesized via Gemini 1.5 Pro within 60 seconds of meeting termination.
   - Delivered directly to your email inbox formatted as concept anchors and an actionable ownership matrix.

5. 🎙️ **NotebookLM-Style Multilingual Podcasts**:
   - Deconstructs dry transcripts into an engaging 2-host conversational podcast banter.
   - Narrated in the user's configured **mother tongue** (English, Spanish, Hindi, French, German, Mandarin, etc.) with dual-voice synthesis and ambient background music stems.

6. 🎨 **Visual Comic Strip Generation**:
   - Distills meeting discussions into a 4-panel visual comic narrative (The Conflict, The Brainstorm, The Breakthrough, and The Next Steps) with AI-generated illustrations and speech bubbles.

---

## 🏗️ Architecture Overview

```
                                [ MeetMee Client Interfaces ]
                                 - Next.js 15 Web Dashboard
                                 - Floating HUD Companion Window
                                               |
                                          WSS  |  HTTPS
                                               v
+------------------------+      +-------------------------------+      +-------------------------+
|  Meeting Platforms     |      | MeetMee API & WebSocket Hub   |      | PostgreSQL 16 + pgvector|
|  (Zoom, Teams, Meet)   |      | (FastAPI / WebSockets / Redis)|      | - Meetings & Profiles   |
+-----------+------------+      +---------------+---------------+      | - Transcripts & Vectors |
            | Audio                             |                      +-------------------------+
            v                                   v
+-----------+------------+      +---------------+---------------+      +-------------------------+
| Headless Bot Fleet     |      | Real-Time Event & RAG Engine  |----->| Google Gemini 1.5 Flash |
| (Recall.ai Ingestion)  |----->| - Mention Phonetic Classifier |      | (Sub-2s Live Q&A RAG)   |
+-----------+------------+      | - Deepgram Nova-2 Streaming   |      +-------------------------+
            |                   +---------------+---------------+
            |                                   |
            | Transcripts                       | Real-Time Answers & Alerts
            v                                   v
+-----------+-----------------------------------+---------------+
| Post-Meeting Transformation Pipeline (Asynchronous Workers)   |
| 1. Hint Summary -> Resend / SES Email Delivery                |
| 2. NotebookLM Podcast Script -> ElevenLabs Dual-Voice Audio   |
| 3. Comic Storyboard -> FLUX.1 Image Gen + Speech Compositor   |
+---------------------------------------------------------------+
```

---

## 📂 Repository Structure

```
MeetMee/
├── backend/                       # Python FastAPI Backend
│   ├── app/
│   │   ├── main.py                # App entrypoint & WebSocket routes
│   │   ├── config.py              # Environment configuration & API keys
│   │   ├── database.py            # SQLAlchemy async engine & pgvector
│   │   ├── models/                # Database entities (User, Meeting, Transcript, Artifact)
│   │   ├── schemas/               # Pydantic schemas
│   │   ├── api/v1/                # REST endpoints (meetings, transcripts, summaries, etc.)
│   │   ├── services/              # AI Engines (Gemini, Deepgram, ElevenLabs, FLUX)
│   │   └── websockets/            # Real-time WebSocket connection manager
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/                      # Next.js 15 App Router Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Quick-Join Landing Page
│   │   │   ├── dashboard/         # Meeting Library & Artifact Viewer
│   │   │   ├── hud/               # Floating Always-on-Top HUD
│   │   │   └── meetings/[id]/     # Live Room & Real-time Transcript
│   │   ├── components/            # UI Components (HUD, Notes, Podcast, Comic)
│   │   └── lib/                   # API and WebSocket clients
│   ├── package.json
│   ├── tailwind.config.ts
│   └── .env.example
├── docker-compose.yml             # Local orchestration (PostgreSQL + Redis + App)
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ and `npm`
- Python 3.11 or 3.12
- PostgreSQL 16 with `pgvector` extension (or Docker)
- API Keys: Google Gemini, Deepgram, Recall.ai, ElevenLabs, Resend

---

### 1. Backend Setup (FastAPI)

```bash
cd backend

# Create virtual environment
python -m venv .venv
# Activate on Windows:
.venv\Scripts\activate
# Activate on Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your API credentials

# Run FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation & Swagger UI will be available at: `http://localhost:8000/docs`

---

### 2. Frontend Setup (Next.js 15)

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

# Run development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 3. Docker Compose (Full Stack + PostgreSQL + Redis)

```bash
docker-compose up -d
```

---

## 💎 Subscription & Pricing Tiers

MeetMee offers flexible subscription tiers tailored for individual professionals, students, and corporate teams:

| Tier | Price | Meeting Allowance | Included Capabilities & Restrictions |
|---|---|---|---|
| **Free Tier** | **₹0** | **3 Meetings Total** | • Autonomous Bot Attendance & Diarization<br>• Real-Time Mentor Q&A Pop-up HUD<br>• Post-Meeting Hint-Style Email Summaries<br>❌ *4-Panel Comic Generator Locked*<br>❌ *Multilingual Podcast Engine Locked* |
| **Monthly Plan** | **₹99 / month** | **Up to 100 Meetings / mo** | • Everything in Free Tier<br>• **✅ 4-Panel Visual Comic Strip Generator UNLOCKED**<br>• Up to 100 meetings recorded & transcribed per month<br>• Monthly History Management (with permanent save)<br>❌ *Multilingual Podcast Engine Locked* |
| **Yearly Plan** | **₹1,099 / year** | **Unlimited Meetings** | • Everything in Monthly Plan<br>• **✅ Unlimited Meeting Attendance**<br>• **✅ NotebookLM Multilingual Podcast Engine UNLOCKED**<br>• **🌟 NEW: Native Language Voice Assistant for General Use** (Hindi, Tamil, Telugu, Spanish, French, English)<br>• Always-Online Virtual Cloud Presence Daemon<br>• Priority GPU Processing Queue |

---

## 🛡️ Retention Policies & User Presence Engine

1. **Virtual Cloud Presence (Always Online)**:
   - MeetMee's cloud daemon maintains the user's participant seat marked as **"Online & Active"** across Zoom, Microsoft Teams, and Google Meet even if local Wi-Fi drops, battery dies, or the laptop lid is closed.
2. **Monthly Meeting Auto-Purge Policy**:
   - All recorded meetings are automatically purged once a month (30-day retention cycle) to keep storage efficient.
   - Users can click **"Save Permanently"** on any meeting record to protect it forever from automated cleanup.
   - Full CRUD actions available per meeting: **Rename Title**, **Save Permanently**, and **Delete**.

---

## 🔒 Privacy & Compliance
- **Consent Announcement**: Autonomous bots announce their presence in the meeting chat and state the user on whose behalf they are recording.
- **Data Retention**: Raw audio files are auto-purged within 14 days by default.
- **PII Masking**: Transcripts pass through automated entity recognition to scrub credit cards, phone numbers, and secrets prior to LLM processing.

---

## 📄 License
This project is licensed under the Apache 2.0 License.
