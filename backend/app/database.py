import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

# If running locally without PostgreSQL container, support SQLite async fallback
db_url = settings.DATABASE_URL
if os.environ.get("USE_SQLITE", "false").lower() == "true":
    db_url = "sqlite+aiosqlite:///./meetmee.db"

# Auto-format Supabase & PostgreSQL connection strings for SQLAlchemy asyncpg
connect_args = {}

if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+asyncpg://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Supabase connection tuning (pooler, prepared statements & SSL)
if "supabase" in db_url.lower():
    # Supabase Transaction Pooler (port 6543) requires statement_cache_size=0 for asyncpg
    connect_args["statement_cache_size"] = 0
    # Enable SSL for Supabase if not specified in URI
    if "ssl=" not in db_url and "sslmode=" not in db_url:
        connect_args["ssl"] = True

engine = create_async_engine(
    db_url,
    echo=(settings.ENVIRONMENT == "development"),
    future=True,
    pool_pre_ping=True,
    connect_args=connect_args
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
    class_=AsyncSession
)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
