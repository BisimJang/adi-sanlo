import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

# Fallback to local sqlite for dev/testing if DATABASE_URL is not set or if we explicitly want sqlite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./adisanlo.db")

# For SQLite, we need to enforce foreign keys since they are off by default, 
# but SQLAlchemy's async engine handles this transparently in most basic setups.
engine = create_async_engine(DATABASE_URL, echo=False)

async_session_maker = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()
