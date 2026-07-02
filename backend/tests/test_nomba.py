import os
import pytest
import httpx
from nomba_client import NombaClient
from dotenv import load_dotenv

load_dotenv()

# Real credentials needed from .env
ACCOUNT_ID = os.getenv("NOMBA_ACCOUNT_ID")
CLIENT_ID = os.getenv("NOMBA_CLIENT_ID")
CLIENT_SECRET = os.getenv("NOMBA_CLIENT_SECRET")

@pytest.fixture
def nomba_client():
    if not all([ACCOUNT_ID, CLIENT_ID, CLIENT_SECRET]):
        pytest.skip("Nomba credentials missing in .env. Skipping live tests.")
        
    return NombaClient(
        account_id=ACCOUNT_ID,
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET
    )

@pytest.mark.asyncio
async def test_get_access_token_live(nomba_client):
    """Hits the live Nomba authentication endpoint."""
    token = await nomba_client._get_access_token()
    assert token is not None
    assert isinstance(token, str)
    assert len(token) > 0

@pytest.mark.asyncio
async def test_create_checkout_live(nomba_client):
    """Hits the live Nomba checkout creation endpoint."""
    response = await nomba_client.create_checkout(
        amount=5000,
        customer_email="test@adisanlo.com",
        callback_url="http://localhost:8000/callbacks/nomba"
    )
    
    assert response is not None
    assert "data" in response
    assert "checkoutLink" in response["data"]
