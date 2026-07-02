"""
Tests for Stage 3: Webhook signature verification and event routing.
"""
import hmac
import hashlib
import json
import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch
from main import app

WEBHOOK_SECRET = "NombaHackathon2026"


def make_signature(payload: bytes, secret: str = WEBHOOK_SECRET) -> str:
    return hmac.new(
        secret.encode(),
        payload,
        hashlib.sha512
    ).hexdigest()


@pytest.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as c:
        yield c


@pytest.mark.asyncio
async def test_health_check(client):
    """API health check endpoint returns 200."""
    response = await client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "Adi-Sanlo API is live"


@pytest.mark.asyncio
async def test_webhook_rejects_invalid_signature(client):
    """Webhook endpoint returns 401 when HMAC signature is invalid."""
    payload = json.dumps({"event": "checkout.completed", "data": {}}).encode()

    with patch.dict("os.environ", {"NOMBA_WEBHOOK_SECRET": WEBHOOK_SECRET}):
        response = await client.post(
            "/webhooks/nomba",
            content=payload,
            headers={
                "Content-Type": "application/json",
                "nomba-signature": "invalidsignature",
            },
        )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_webhook_accepts_valid_signature(client):
    """Webhook endpoint returns 200 when HMAC signature is valid."""
    payload = json.dumps({
        "event": "checkout.failed",
        "data": {"customerEmail": "test@example.com", "reason": "card declined"}
    }).encode()
    signature = make_signature(payload)

    with patch.dict("os.environ", {"NOMBA_WEBHOOK_SECRET": WEBHOOK_SECRET}):
        response = await client.post(
            "/webhooks/nomba",
            content=payload,
            headers={
                "Content-Type": "application/json",
                "nomba-signature": signature,
            },
        )
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_webhook_handles_unknown_event(client):
    """Unknown event types are silently ignored and still return 200."""
    payload = json.dumps({
        "event": "some.unknown.event",
        "data": {}
    }).encode()
    signature = make_signature(payload)

    with patch.dict("os.environ", {"NOMBA_WEBHOOK_SECRET": WEBHOOK_SECRET}):
        response = await client.post(
            "/webhooks/nomba",
            content=payload,
            headers={
                "Content-Type": "application/json",
                "nomba-signature": signature,
            },
        )
    assert response.status_code == 200
