import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import engine
from models import Base
from routers import webhooks, plans, subscriptions, invoices, metrics, auth
from cron import cron_loop

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables ensured.")
    
    # Start the auto-charge cron engine
    task = asyncio.create_task(cron_loop())
    
    yield
    
    # Shutdown
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="Adi-Sanlo API",
    description="Managed subscription billing for Nigerian AI/SaaS — powered by Nomba.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:4000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:4000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(webhooks.router)
app.include_router(auth.router, prefix="/v1")
app.include_router(plans.router, prefix="/v1")
app.include_router(subscriptions.router, prefix="/v1")
app.include_router(invoices.router, prefix="/v1")
app.include_router(metrics.router, prefix="/v1")


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "Adi-Sanlo API is live", "version": "0.1.0"}
