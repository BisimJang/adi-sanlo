import logging
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database import get_db
from models import Subscription, Invoice, DunningEvent, Tenant
from dependencies import get_current_tenant

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/metrics", tags=["Metrics"])


@router.get("/mrr")
async def get_mrr(db: AsyncSession = Depends(get_db), tenant: Tenant = Depends(get_current_tenant)):
    """Monthly Recurring Revenue from all active subscriptions for this tenant."""
    from models import Plan
    result = await db.execute(
        select(func.sum(Plan.base_amount))
        .join(Subscription, Subscription.plan_id == Plan.id)
        .where(Subscription.status == "active", Subscription.tenant_id == tenant.id)
    )
    mrr = result.scalar() or 0
    return {"mrr": mrr, "currency": "NGN"}


@router.get("/active")
async def get_active_subscribers(db: AsyncSession = Depends(get_db), tenant: Tenant = Depends(get_current_tenant)):
    """Total active subscriber count for this tenant."""
    result = await db.execute(
        select(func.count(Subscription.id))
        .where(Subscription.status == "active", Subscription.tenant_id == tenant.id)
    )
    count = result.scalar() or 0
    return {"active_subscribers": count}


@router.get("/failed")
async def get_failed_payments(db: AsyncSession = Depends(get_db), tenant: Tenant = Depends(get_current_tenant)):
    """Number of failed payment invoices this month for this tenant."""
    from datetime import datetime
    now = datetime.utcnow()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    result = await db.execute(
        select(func.count(Invoice.id))
        .where(Invoice.status == "failed", Invoice.tenant_id == tenant.id)
        .where(Invoice.created_at >= start_of_month)
    )
    count = result.scalar() or 0
    return {"failed_payments": count}


@router.get("/churn")
async def get_churn_rate(db: AsyncSession = Depends(get_db), tenant: Tenant = Depends(get_current_tenant)):
    """
    Churn rate = cancelled this month / active at start of month.
    Returns a percentage.
    """
    from datetime import datetime
    now = datetime.utcnow()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    result = await db.execute(
        select(func.count(Subscription.id))
        .where(Subscription.status == "cancelled", Subscription.tenant_id == tenant.id)
        .where(Subscription.updated_at >= start_of_month)
    )
    cancelled = result.scalar() or 0

    result = await db.execute(
        select(func.count(Subscription.id))
        .where(Subscription.status.in_(["active", "cancelled"]), Subscription.tenant_id == tenant.id)
    )
    total = result.scalar() or 1  # avoid division by zero

    churn = round((cancelled / total) * 100, 2)
    return {"churn_rate": churn, "cancelled_this_month": cancelled}


@router.get("/recent-activity")
async def get_recent_activity(db: AsyncSession = Depends(get_db), tenant: Tenant = Depends(get_current_tenant)):
    """Last 10 subscription and invoice events for the activity feed for this tenant."""
    result = await db.execute(
        select(Invoice)
        .where(Invoice.tenant_id == tenant.id)
        .order_by(Invoice.created_at.desc())
        .limit(10)
    )
    invoices = result.scalars().all()

    activity = []
    for inv in invoices:
        if inv.status == "paid":
            event = "invoice.paid"
        elif inv.status == "failed":
            event = "charge.failed"
        else:
            event = "invoice.pending"

        activity.append({
            "event": event,
            "invoice_id": inv.id,
            "amount": inv.amount,
            "status": inv.status,
            "timestamp": inv.created_at,
        })

    return activity


@router.get("/webhook-logs")
async def get_webhook_logs(db: AsyncSession = Depends(get_db), tenant: Tenant = Depends(get_current_tenant)):
    """Recent dunning events as a proxy for webhook processing logs."""
    # We join with Subscription to filter by tenant_id
    result = await db.execute(
        select(DunningEvent)
        .join(Subscription, DunningEvent.subscription_id == Subscription.id)
        .where(Subscription.tenant_id == tenant.id)
        .order_by(DunningEvent.created_at.desc())
        .limit(50)
    )
    events = result.scalars().all()
    return events
