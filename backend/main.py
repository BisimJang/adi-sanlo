import hmac
import hashlib
import json
import os
from fastapi import FastAPI, Request, HTTPException
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Adi-Sanlo API", version="0.1.0")

WEBHOOK_SECRET = os.getenv("NOMBA_WEBHOOK_SECRET", "")


# ─────────────────────────────────────────
# HEALTH CHECK
# ─────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "Adi-Sanlo API is live 🚀", "version": "0.1.0"}


# ─────────────────────────────────────────
# NOMBA WEBHOOK ENDPOINT
# ─────────────────────────────────────────
@app.post("/webhooks/nomba")
async def nomba_webhook(request: Request):
    payload = await request.body()
    signature = request.headers.get("x-nomba-signature", "")

    # Verify HMAC-SHA512 signature — reject unsigned events
    expected = hmac.new(
        WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha512
    ).hexdigest()

    if not hmac.compare_digest(expected, signature):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")

    event = json.loads(payload)
    event_type = event.get("event")

    print(f"✅ Webhook received: {event_type}")

    # Route to correct handler
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
        await handler(event.get("data", {}))
    else:
        print(f"⚠️  Unhandled event type: {event_type}")

    # Always return 200 — never leave Nomba hanging
    return {"status": "ok"}


# ─────────────────────────────────────────
# EVENT HANDLERS (expand during build week)
# ─────────────────────────────────────────
async def handle_checkout_completed(data: dict):
    """
    Fired when a customer completes checkout.
    - Extract tokenKey from data
    - Save tokenized card to customer record
    - Activate subscription
    """
    print(f"💳 Checkout complete: {data}")


async def handle_checkout_failed(data: dict):
    """
    Fired when checkout payment fails.
    - Log failure reason
    - Notify customer
    - Keep subscription in 'incomplete' state
    """
    print(f"❌ Checkout failed: {data}")


async def handle_mandate_active(data: dict):
    """
    Fired when a Direct Debit mandate is confirmed by customer.
    - Save mandate ID to customer record
    - Activate subscription
    """
    print(f"✅ Mandate active: {data}")


async def handle_mandate_cancelled(data: dict):
    """
    Fired when a mandate is cancelled (by customer or bank).
    - Cancel linked subscription
    - Notify customer
    """
    print(f"🚫 Mandate cancelled: {data}")


async def handle_debit_success(data: dict):
    """
    Fired when a Direct Debit payment succeeds.
    - Mark invoice as paid
    - Reset dunning state
    - Emit invoice.paid webhook to tenant app
    """
    print(f"💚 Debit success: {data}")


async def handle_debit_failed(data: dict):
    """
    Fired when a Direct Debit payment fails.
    - Log failure + error code
    - Enter dunning sequence
    - Schedule retry
    - Send appropriate email based on error type
    """
    print(f"🔴 Debit failed: {data}")
