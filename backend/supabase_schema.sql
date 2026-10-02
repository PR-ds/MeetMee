-- =========================================================================
-- MeetMee AI Meeting Intelligence Platform - Supabase PostgreSQL Schema
-- Includes native pgvector support for semantic vector embeddings & sub-second RAG
-- =========================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phonetic_aliases TEXT DEFAULT '[]',
    mother_tongue VARCHAR(10) DEFAULT 'en',
    role VARCHAR(50) DEFAULT 'corporate_employee',
    mentor_names TEXT DEFAULT '[]',
    enable_chime_alert BOOLEAN DEFAULT TRUE,
    enable_screen_flash BOOLEAN DEFAULT TRUE,
    enable_qa_popup BOOLEAN DEFAULT TRUE,
    subscription_tier VARCHAR(20) DEFAULT 'free', -- 'free', 'monthly' (₹99), 'yearly' (₹1099)
    meetings_used VARCHAR(10) DEFAULT '0',
    allow_comic BOOLEAN DEFAULT FALSE,
    allow_podcast BOOLEAN DEFAULT FALSE,
    allow_native_assistant BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 3. Meetings Table
CREATE TABLE IF NOT EXISTS meetings (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) DEFAULT 'Untitled Meeting',
    platform VARCHAR(50) NOT NULL, -- 'google_meet', 'zoom', 'ms_teams'
    meeting_url TEXT NOT NULL,
    bot_session_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'failed'
    scheduled_start TIMESTAMP WITH TIME ZONE,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    raw_audio_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_created_at ON meetings(created_at);

-- 4. Transcript Segments (Live Speech Turn by Turn)
CREATE TABLE IF NOT EXISTS transcript_segments (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    meeting_id VARCHAR(36) NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    speaker_index INT DEFAULT 0,
    speaker_name VARCHAR(255) DEFAULT 'Unknown',
    text TEXT NOT NULL,
    start_time_ms INT NOT NULL,
    end_time_ms INT NOT NULL,
    confidence FLOAT DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transcript_segments_meeting_id ON transcript_segments(meeting_id);

-- 5. Transcript Chunks with pgvector Semantic Embeddings
CREATE TABLE IF NOT EXISTS transcript_chunks (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    meeting_id VARCHAR(36) NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    text TEXT NOT NULL,
    start_time_ms INT NOT NULL,
    end_time_ms INT NOT NULL,
    embedding vector(768), -- Google Gemini / text-embedding-004 dimension
    embedding_json TEXT, -- JSON backup for compatibility
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transcript_chunks_meeting_id ON transcript_chunks(meeting_id);

-- 6. Realtime Events (Mentor Questions, Name Addresses)
CREATE TABLE IF NOT EXISTS realtime_events (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    meeting_id VARCHAR(36) NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'mentor_question', 'name_mention', 'action_item'
    trigger_text TEXT NOT NULL,
    speaker_name VARCHAR(255) DEFAULT 'Unknown',
    timestamp_ms INT NOT NULL,
    suggested_response TEXT,
    confidence VARCHAR(20) DEFAULT 'high',
    was_displayed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_realtime_events_meeting_id ON realtime_events(meeting_id);

-- 7. Meeting Summaries & Hint Notes
CREATE TABLE IF NOT EXISTS meeting_summaries (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    meeting_id VARCHAR(36) UNIQUE NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    tldr_json TEXT NOT NULL, -- JSON array of 3 bullet takeaways
    hint_notes_json TEXT NOT NULL, -- Concept anchors & hints
    action_items_json TEXT NOT NULL, -- Interactive task checklist
    email_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Meeting Podcasts (Multilingual Dialogue)
CREATE TABLE IF NOT EXISTS meeting_podcasts (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    meeting_id VARCHAR(36) UNIQUE NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    language_code VARCHAR(10) DEFAULT 'en',
    dialogue_script_json TEXT NOT NULL,
    audio_file_url TEXT NOT NULL,
    duration_seconds INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Meeting Comic Strips
CREATE TABLE IF NOT EXISTS meeting_comics (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    meeting_id VARCHAR(36) UNIQUE NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    panel_count INT DEFAULT 4,
    panels_json TEXT NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Seed VIP Lifetime Account for ABIRAMI P
INSERT INTO users (
    id,
    email,
    full_name,
    role,
    subscription_tier,
    allow_comic,
    allow_podcast,
    allow_native_assistant
) VALUES (
    'usr-vip-abirami',
    'prabhuragul97892@gmail.com',
    'ABIRAMI P',
    'Chief Operating Officer (Lifetime VIP)',
    'yearly',
    TRUE,
    TRUE,
    TRUE
)
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    subscription_tier = 'yearly',
    allow_comic = TRUE,
    allow_podcast = TRUE,
    allow_native_assistant = TRUE;
