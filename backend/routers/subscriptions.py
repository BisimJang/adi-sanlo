import uuid
import logging
import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models import Plan, Customer, Subscription, Invoice, Tenant
from schemas import SubscriptionCreate, SubscriptionResponse
from nomba_client import NombaClient
from dependencies import get_current_tenant

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])

CALLBACK_BASE = os.getenv("APP_BASE_URL", "https://adi-sanlo-production.up.railway.app")


def get_nomba_client() -> NombaClient:
    return NombaClient(
        parent_account_id=os.getenv("NOMBA_ACCOUNT_ID"),
        sub_account_id=os.getenv("NOMBA_SUB_ACCOUNT_ID", "bb660a27-be50-48d5-991a-5ab223f9b3af"),
        client_id=os.getenv("NOMBA_CLIENT_ID"),
        client_secret=os.getenv("NOMBA_CLIENT_SECRET"),
    )


@router.post("", status_code=201)
async def create_subscription(
    body: SubscriptionCreate,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant)
):
    """
    Create a subscription for a customer on a plan.
    Returns a Nomba checkout URL for the customer to complete payment.
    """
    # Verify plan exists and belongs to tenant
    result = await db.execute(select(Plan).where(Plan.id == body.plan_id, Plan.is_active == True, Plan.tenant_id == tenant.id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found or inactive")

    # Get or create customer
    result = await db.execute(
        select(Customer).where(Customer.email == body.customer_email, Customer.tenant_id == tenant.id)
    )
    customer = result.scalar_one_or_none()
    if not customer:
        customer = Customer(
            id=str(uuid.uuid4()),
            tenant_id=tenant.id,
            external_id=body.customer_email,
            email=body.customer_email,
            name=body.customer_name,
        )
        db.add(customer)
        await db.flush()

    # Create subscription in incomplete state
    subscription = Subscription(
        id=str(uuid.uuid4()),
        tenant_id=tenant.id,
        customer_id=customer.id,
        plan_id=plan.id,
        status="incomplete",
    )
    db.add(subscription)
    await db.flush()

    # Create pending invoice
    invoice = Invoice(
        id=str(uuid.uuid4()),
        tenant_id=tenant.id,
        subscription_id=subscription.id,
        customer_id=customer.id,
        amount=plan.base_amount,
        status="open",
        attempt_count=0,
    )
    db.add(invoice)
    await db.flush()

    # Create Nomba checkout
    callback_url = body.callback_url or f"{CALLBACK_BASE}/callbacks/nomba"
    nomba = get_nomba_client()
    checkout_response = await nomba.create_checkout(
        amount=plan.base_amount / 100,  # convert kobo to naira
        customer_email=body.customer_email,
        callback_url=callback_url,
    )

    checkout_url = checkout_response.get("data", {}).get("checkoutLink")

    await db.commit()

    return {
        "subscription_id": subscription.id,
        "invoice_id": invoice.id,
        "status": subscription.status,
        "checkout_url": checkout_url,
    }


@router.get("")
async def list_subscriptions(
    status: str = None,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant)
):
    """List all subscriptions for this tenant, optionally filtered by status."""
    query = select(Subscription).where(Subscription.tenant_id == tenant.id)
    if status:
        query = query.where(Subscription.status == status)
    result = await db.execute(query.order_by(Subscription.created_at.desc()))
    subscriptions = result.scalars().all()
    return [
        {
            "id": s.id,
            "customer_id": s.customer_id,
            "plan_id": s.plan_id,
            "status": s.status,
            "current_period_start": s.current_period_start,
            "current_period_end": s.current_period_end,
            "created_at": s.created_at,
        }
        for s in subscriptions
    ]


@router.post("/{subscription_id}/pause")
async def pause_subscription(subscription_id: str, db: AsyncSession = Depends(get_db), tenant: Tenant = Depends(get_current_tenant)):
    """Pause an active subscription."""
    result = await db.execute(select(Subscription).where(Subscription.id == subscription_id, Subscription.tenant_id == tenant.id))
    subscription = result.scalar_one_or_none()
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    if subscription.status != "active":
        raise HTTPException(status_code=400, detail="Only active subscriptions can be paused")
    subscription.status = "paused"
    from datetime import datetime
    subscription.paused_at = datetime.utcnow()
    await db.commit()
    return {"status": "paused", "subscription_id": subscription_id}


@router.post("/{subscription_id}/cancel")
async def cancel_subscription(subscription_id: str, db: AsyncSession = Depends(get_db), tenant: Tenant = Depends(get_current_tenant)):
    """Cancel a subscription."""
    result = await db.execute(select(Subscription).where(Subscription.id == subscription_id, Subscription.tenant_id == tenant.id))
    subscription = result.scalar_one_or_none()
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    if subscription.status == "cancelled":
        raise HTTPException(status_code=400, detail="Subscription is already cancelled")
    subscription.status = "cancelled"
    from datetime import datetime
    subscription.cancelled_at = datetime.utcnow()
    await db.commit()
    return {"status": "cancelled", "subscription_id": subscription_id}
