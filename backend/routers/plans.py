import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models import Plan
from schemas import PlanCreate, PlanResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/plans", tags=["Plans"])


@router.post("", response_model=PlanResponse, status_code=201)
async def create_plan(body: PlanCreate, db: AsyncSession = Depends(get_db)):
    """Create a new billing plan."""
    plan = Plan(
        id=str(uuid.uuid4()),
        name=body.name,
        amount=body.amount,
        currency=body.currency,
        interval=body.interval.value,
        description=body.description,
        is_active=True,
    )
    db.add(plan)
    await db.commit()
    await db.refresh(plan)
    return plan


@router.get("", response_model=list[PlanResponse])
async def list_plans(db: AsyncSession = Depends(get_db)):
    """List all active plans."""
    result = await db.execute(
        select(Plan).where(Plan.is_active == True).order_by(Plan.created_at.desc())
    )
    return result.scalars().all()


@router.get("/top")
async def top_plans(db: AsyncSession = Depends(get_db)):
    """Return top plans ranked by active subscriber count."""
    from sqlalchemy import func
    from models import Subscription

    result = await db.execute(
        select(
            Plan.id,
            Plan.name,
            Plan.amount,
            func.count(Subscription.id).label("subscriber_count")
        )
        .join(Subscription, Subscription.plan_id == Plan.id, isouter=True)
        .where(Subscription.status == "active")
        .group_by(Plan.id)
        .order_by(func.count(Subscription.id).desc())
    )
    rows = result.all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "amount": r.amount,
            "subscriber_count": r.subscriber_count,
            "mrr": r.amount * r.subscriber_count,
        }
        for r in rows
    ]


@router.delete("/{plan_id}")
async def deactivate_plan(plan_id: str, db: AsyncSession = Depends(get_db)):
    """Deactivate a plan (soft delete)."""
    result = await db.execute(select(Plan).where(Plan.id == plan_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    plan.is_active = False
    await db.commit()
    return {"status": "deactivated", "plan_id": plan_id}
