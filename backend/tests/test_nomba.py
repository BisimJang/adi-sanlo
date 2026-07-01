import pytest
import respx
import httpx
from nomba_client import NombaClient

@pytest.fixture
def nomba_client():
    return NombaClient(
        account_id="acc_123",
        client_id="client_abc",
        client_secret="secret_xyz"
    )

@pytest.mark.asyncio
@respx.mock
async def test_get_access_token(nomba_client):
    # Mock the auth token endpoint
    respx.post("https://api.nomba.com/v1/auth/token").mock(
        return_value=httpx.Response(200, json={
            "data": {
                "access_token": "mocked_token_123",
                "expires_in": 3600
            }
        })
    )

    token = await nomba_client._get_access_token()
    assert token == "mocked_token_123"
    assert nomba_client.access_token == "mocked_token_123"

@pytest.mark.asyncio
@respx.mock
async def test_create_checkout(nomba_client):
    # Mock auth first
    respx.post("https://api.nomba.com/v1/auth/token").mock(
        return_value=httpx.Response(200, json={
            "data": {"access_token": "mocked_token_123", "expires_in": 3600}
        })
    )

    # Mock checkout creation
    respx.post("https://api.nomba.com/v1/checkout/order").mock(
        return_value=httpx.Response(200, json={
            "data": {
                "checkoutLink": "https://checkout.nomba.com/pay/abc",
                "orderReference": "ord_123"
            }
        })
    )

    response = await nomba_client.create_checkout(
        amount=5000,
        customer_email="test@example.com",
        callback_url="http://localhost/callback"
    )
    
    assert response["data"]["checkoutLink"] == "https://checkout.nomba.com/pay/abc"

@pytest.mark.asyncio
@respx.mock
async def test_charge_tokenized_card(nomba_client):
    # Mock auth
    respx.post("https://api.nomba.com/v1/auth/token").mock(
        return_value=httpx.Response(200, json={
            "data": {"access_token": "mocked_token_123", "expires_in": 3600}
        })
    )

    # Mock token charge
    respx.post("https://api.nomba.com/v1/checkout/tokenized-card-payment").mock(
        return_value=httpx.Response(200, json={
            "data": {
                "status": "success",
                "transactionReference": "tx_abc123"
            }
        })
    )

    response = await nomba_client.charge_tokenized_card(
        token="tok_visa_123",
        amount=5000,
        customer_email="test@example.com"
    )

    assert response["data"]["status"] == "success"
