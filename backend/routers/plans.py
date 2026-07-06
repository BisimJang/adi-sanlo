import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database import get_db
from models import Plan, Subscription, Tenant
from schemas import PlanCreate, PlanResponse
from dependencies import get_current_tenant

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/plans", tags=["Plans"])


@router.post("", response_model=PlanResponse, status_code=201)
async def create_plan(body: PlanCreate, db: AsyncSession = Depends(get_db), tenant: Tenant = Depends(get_current_tenant)):
    """Create a new billing plan."""
    plan = Plan(
        id=str(uuid.uuid4()),
        tenant_id=tenant.id,
        name=body.name,
        base_amount=body.amount,
        billing_model="flat",
        interval=body.interval.value,
        description=body.description,
        is_active=True,
    )
    db.add(plan)
    await db.commit()
    await db.refresh(plan)
    return plan


@router.get("", response_model=list[PlanResponse])
async def list_plans(db: AsyncSession = Depends(get_db), tenant: Tenant = Depends(get_current_tenant)):
    """List all active plans."""
    result = await db.execute(
        select(Plan).where(Plan.is_active == True, Plan.tenant_id == tenant.id).order_by(Plan.created_at.desc())
    )
    return result.scalars().all()


@router.get("/top")
async def top_plans(db: AsyncSession = Depends(get_db), tenant: Tenant = Depends(get_current_tenant)):
    """Return top plans ranked by active subscriber count."""
    result = await db.execute(
        select(
            Plan.id,
            Plan.name,
            Plan.base_amount.label("amount"),
            func.count(Subscription.id).label("subscriber_count")
        )
        .join(Subscription, Subscription.plan_id == Plan.id, isouter=True)
        .where(Subscription.status == "active", Plan.tenant_id == tenant.id)
        .group_by(Plan.id, Plan.name, Plan.base_amount)
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
async def deactivate_plan(plan_id: str, db: AsyncSession = Depends(get_db), tenant: Tenant = Depends(get_current_tenant)):
    """Deactivate a plan (soft delete)."""
    result = await db.execute(select(Plan).where(Plan.id == plan_id, Plan.tenant_id == tenant.id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    plan.is_active = False
    await db.commit()
    return {"status": "deactivated", "plan_id": plan_id}
