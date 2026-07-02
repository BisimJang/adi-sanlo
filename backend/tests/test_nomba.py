import os
import pytest
from nomba_client import NombaClient
from dotenv import load_dotenv

load_dotenv()

PARENT_ACCOUNT_ID = os.getenv("NOMBA_ACCOUNT_ID")
SUB_ACCOUNT_ID = os.getenv("NOMBA_SUB_ACCOUNT_ID", "bb660a27-be50-48d5-991a-5ab223f9b3af")
CLIENT_ID = os.getenv("NOMBA_CLIENT_ID")
CLIENT_SECRET = os.getenv("NOMBA_CLIENT_SECRET")

@pytest.fixture
def nomba_client():
    if not all([PARENT_ACCOUNT_ID, CLIENT_ID, CLIENT_SECRET]):
        pytest.skip("Nomba credentials missing in .env. Skipping live tests.")

    return NombaClient(
        parent_account_id=PARENT_ACCOUNT_ID,
        sub_account_id=SUB_ACCOUNT_ID,
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
        amount=100,
        customer_email="jason@gmail.com",
        callback_url="https://adi-sanlo-production.up.railway.app/callbacks/nomba"
    )
    
    assert response is not None
    assert "data" in response
    assert "checkoutLink" in response["data"]
