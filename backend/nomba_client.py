import httpx
import logging
import os
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class NombaClient:
    def __init__(self, parent_account_id: str, sub_account_id: str, client_id: str, client_secret: str):
        base = os.getenv("NOMBA_BASE_URL", "https://api.nomba.com/v1").rstrip("/")
        if not base.endswith("/v1"):
            base += "/v1"
        self.BASE_URL = base
        
        self.parent_account_id = parent_account_id
        self.sub_account_id = sub_account_id
        self.client_id = client_id
        self.client_secret = client_secret
        self.access_token = None
        self.token_expires_at = None
        self.client = httpx.AsyncClient()

    async def _get_access_token(self) -> str:
        # Check if we have a valid cached token
        if self.access_token and self.token_expires_at and datetime.utcnow() < self.token_expires_at:
            return self.access_token

        # Otherwise, fetch a new one
        url = f"{self.BASE_URL}/auth/token/issue"
        response = await self.client.post(
            url,
            json={
                "grant_type": "client_credentials",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
            },
            headers={"accountId": self.parent_account_id}
        )
        response.raise_for_status()
        data = response.json()
        
        self.access_token = data.get("data", {}).get("access_token")
        expires_in = data.get("data", {}).get("expires_in", 3600)
        self.token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in - 60) # 60s buffer
        
        return self.access_token

    async def _request(self, method: str, endpoint: str, **kwargs):
        token = await self._get_access_token()
        headers = kwargs.pop("headers", {})
        headers["Authorization"] = f"Bearer {token}"
        headers["accountId"] = self.sub_account_id
        
        url = f"{self.BASE_URL}{endpoint if endpoint.startswith('/') else '/' + endpoint}"
        response = await self.client.request(method, url, headers=headers, **kwargs)
        response.raise_for_status()
        return response.json()

    async def create_checkout(self, amount: float, customer_email: str, callback_url: str, metadata: dict = None):
        """Creates a checkout session for tokenizing a card or taking initial payment."""
        payload = {
            "order": {
                "orderReference": f"ord_{int(datetime.utcnow().timestamp())}",
                "customerEmail": customer_email,
                "callbackUrl": callback_url,
                "amount": amount,
                "currency": "NGN"
            }
        }
        
        # Nomba checkout endpoint
        response = await self._request("POST", "/checkout/order", json=payload)
        return response

    async def create_mandate(self, account_number: str, bank_code: str, amount: float, callback_url: str):
        """Creates a direct debit mandate authorization."""
        payload = {
            "accountNumber": account_number,
            "bankCode": bank_code,
            "amount": amount,
            "frequency": "monthly",
            "startDate": datetime.utcnow().isoformat(),
            "callbackUrl": callback_url
        }
        
        # Hypothetical endpoint based on architecture docs
        response = await self._request("POST", "/direct-debits", json=payload)
        return response

    async def charge_tokenized_card(self, token: str, amount: float, customer_email: str):
        """Charges a previously tokenized card."""
        payload = {
            "amount": amount,
            "customerEmail": customer_email,
            "token": token
        }
        
        response = await self._request("POST", "/checkout/tokenized-card-payment", json=payload)
        return response
