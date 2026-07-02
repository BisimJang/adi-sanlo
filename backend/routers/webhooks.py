import hmac
import hashlib
import json
import os
import uuid
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models import Customer, Subscription, Invoice, DunningEvent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


def verify_signature(payload: bytes, signature: str) -> bool:
    """Verify HMAC-SHA512 signature from Nomba."""
    secret = os.getenv("NOMBA_WEBHOOK_SECRET", "")
    if not secret:
        return True  # No secret configured, skip verification
    expected = hmac.new(secret.encode(), payload, hashlib.sha512).hexdigest()
    return hmac.compare_digest(expected, signature)


@router.post("/nomba")
async def nomba_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await request.body()
    signature = request.headers.get("nomba-signature", "")

    if not verify_signature(payload, signature):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")

    event = json.loads(payload)
    event_type = event.get("event")
    data = event.get("data", {})

    logger.info(f"Webhook received: {event_type}")

    handlers = {
        "checkout.completed":             handle_checkout_completed,
        "checkout.failed":                handle_checkout_failed,
        "direct_debit.mandate.active":    handle_mandate_active,
        "direct_debit.mandate.cancelled": handle_mandate_cancelled,
        "direct_debit.payment.success":   handle_debit_success,
        "direct_debit.payment.failed":    handle_debit_failed,
    }

    handler = handlers.get(event_type)
    if handler:
        await handler(data, db)
    else:
        logger.warning(f"Unhandled event type: {event_type}")

    # Always return 200 — never leave Nomba hanging
    return {"status": "ok"}


# ─── Event Handlers ───────────────────────────────────────────────────────────

async def handle_checkout_completed(data: dict, db: AsyncSession):
    """
    Fired when a customer completes checkout.
    - Save card token to customer record
    - Activate the linked subscription
    - Create and mark initial invoice as paid
    """
    order_ref = data.get("orderReference", "")
    card_token = data.get("tokenKey") or data.get("cardToken")
    customer_email = data.get("customerEmail")

    if not customer_email:
        logger.warning("checkout.completed missing customerEmail")
        return

    # Find customer
    result = await db.execute(select(Customer).where(Customer.email == customer_email))
    customer = result.scalar_one_or_none()
    if not customer:
        logger.warning(f"No customer found for email: {customer_email}")
        return

    # Save tokenized card
    if card_token:
        customer.nomba_token = card_token
        await db.flush()

    # Find the incomplete subscription for this customer
    result = await db.execute(
        select(Subscription)
        .where(Subscription.customer_id == customer.id)
        .where(Subscription.status == "incomplete")
        .order_by(Subscription.created_at.desc())
    )
    subscription = result.scalar_one_or_none()
    if not subscription:
        logger.warning(f"No incomplete subscription for customer: {customer_email}")
        return

    # Activate subscription
    now = datetime.now(timezone.utc)
    subscription.status = "active"
    subscription.current_period_start = now

    # Set period end based on plan interval
    from models import Plan
    result = await db.execute(select(Plan).where(Plan.id == subscription.plan_id))
    plan = result.scalar_one_or_none()

    if plan and plan.interval == "yearly":
        from dateutil.relativedelta import relativedelta
        subscription.current_period_end = now + relativedelta(years=1)
    else:
        from dateutil.relativedelta import relativedelta
        subscription.current_period_end = now + relativedelta(months=1)

    # Mark the open invoice as paid
    result = await db.execute(
        select(Invoice)
        .where(Invoice.subscription_id == subscription.id)
        .where(Invoice.status == "open")
    )
    invoice = result.scalar_one_or_none()
    if invoice:
        invoice.status = "paid"
        invoice.paid_at = now
        invoice.nomba_tx_ref = order_ref

    await db.commit()
    logger.info(f"Subscription {subscription.id} activated for {customer_email}")


async def handle_checkout_failed(data: dict, db: AsyncSession):
    """
    Fired when checkout payment fails.
    Keep subscription in 'incomplete' state — customer can retry.
    """
    customer_email = data.get("customerEmail")
    logger.warning(f"Checkout failed for {customer_email}: {data.get('reason')}")


async def handle_mandate_active(data: dict, db: AsyncSession):
    """
    Fired when a Direct Debit mandate is confirmed.
    - Save mandate ID to customer record
    - Activate subscription
    """
    mandate_id = data.get("mandateId")
    account_number = data.get("accountNumber")

    # Find customer by mandate_id or nomba_token (mandate linked at creation)
    result = await db.execute(
        select(Customer).where(Customer.nomba_token == mandate_id)
    )
    customer = result.scalar_one_or_none()
    if not customer:
        logger.warning(f"No customer found for mandate: {mandate_id}")
        return

    result = await db.execute(
        select(Subscription)
        .where(Subscription.customer_id == customer.id)
        .where(Subscription.status == "incomplete")
        .order_by(Subscription.created_at.desc())
    )
    subscription = result.scalar_one_or_none()
    if subscription:
        from dateutil.relativedelta import relativedelta
        now = datetime.now(timezone.utc)
        subscription.status = "active"
        subscription.current_period_start = now
        subscription.current_period_end = now + relativedelta(months=1)

    await db.commit()
    logger.info(f"Mandate {mandate_id} active, subscription activated")


async def handle_mandate_cancelled(data: dict, db: AsyncSession):
    """
    Fired when a mandate is cancelled.
    Cancel the linked subscription.
    """
    mandate_id = data.get("mandateId")

    result = await db.execute(
        select(Customer).where(Customer.mandate_id == mandate_id)
    )
    customer = result.scalar_one_or_none()
    if not customer:
        return

    result = await db.execute(
        select(Subscription)
        .where(Subscription.customer_id == customer.id)
        .where(Subscription.status == "active")
    )
    subscription = result.scalar_one_or_none()
    if subscription:
        subscription.status = "cancelled"

    await db.commit()
    logger.info(f"Mandate {mandate_id} cancelled, subscription cancelled")


async def handle_debit_success(data: dict, db: AsyncSession):
    """
    Fired when a Direct Debit renewal payment succeeds.
    - Mark invoice as paid
    - Reset dunning state
    - Advance billing period
    """
    mandate_id = data.get("mandateId")
    amount = data.get("amount")
    reference = data.get("transactionReference")
    now = datetime.now(timezone.utc)

    result = await db.execute(
        select(Customer).where(Customer.mandate_id == mandate_id)
    )
    customer = result.scalar_one_or_none()
    if not customer:
        return

    result = await db.execute(
        select(Subscription)
        .where(Subscription.customer_id == customer.id)
        .where(Subscription.status.in_(["active", "past_due"]))
    )
    subscription = result.scalar_one_or_none()
    if not subscription:
        return

    # Mark pending invoice paid
    result = await db.execute(
        select(Invoice)
        .where(Invoice.subscription_id == subscription.id)
        .where(Invoice.status == "open")
    )
    invoice = result.scalar_one_or_none()
    if invoice:
        invoice.status = "paid"
        invoice.paid_at = now
        invoice.nomba_tx_ref = reference

    # Advance billing period
    from dateutil.relativedelta import relativedelta
    subscription.status = "active"
    subscription.current_period_start = now
    subscription.current_period_end = now + relativedelta(months=1)

    await db.commit()
    logger.info(f"Debit success for mandate {mandate_id}, period advanced")


async def handle_debit_failed(data: dict, db: AsyncSession):
    """
    Fired when a Direct Debit renewal payment fails.
    - Log dunning event
    - Set subscription to past_due
    """
    mandate_id = data.get("mandateId")
    error_code = data.get("errorCode", "unknown")
    reason = data.get("reason", "Payment failed")
    now = datetime.now(timezone.utc)

    result = await db.execute(
        select(Customer).where(Customer.mandate_id == mandate_id)
    )
    customer = result.scalar_one_or_none()
    if not customer:
        return

    result = await db.execute(
        select(Subscription)
        .where(Subscription.customer_id == customer.id)
        .where(Subscription.status == "active")
    )
    subscription = result.scalar_one_or_none()
    if not subscription:
        return

    # Set to past_due
    subscription.status = "past_due"

    # Get linked invoice
    result = await db.execute(
        select(Invoice)
        .where(Invoice.subscription_id == subscription.id)
        .where(Invoice.status.in_(["open", "paid"]))
        .order_by(Invoice.created_at.desc())
    )
    invoice = result.scalar_one_or_none()
    if invoice:
        invoice.attempt_count += 1

        # Log dunning event
        dunning = DunningEvent(
            id=str(uuid.uuid4()),
            invoice_id=invoice.id,
            subscription_id=subscription.id,
            attempt_number=invoice.attempt_count,
            result="failed",
            nomba_error=f"{error_code}: {reason}",
        )
        db.add(dunning)

    await db.commit()
    logger.warning(f"Debit failed for mandate {mandate_id}: {reason}")
