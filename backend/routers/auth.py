import uuid
import secrets
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from database import get_db
from models import Tenant

router = APIRouter(prefix="/auth", tags=["Auth"])

class SignupRequest(BaseModel):
    business_name: str

class SignupResponse(BaseModel):
    tenant_id: str
    api_key: str

@router.post("/signup", response_model=SignupResponse)
async def signup(body: SignupRequest, db: AsyncSession = Depends(get_db)):
    """
    Creates a new Tenant and generates a secure API Key.
    """
    tenant_id = str(uuid.uuid4())
    # Generate a secure random API key prefix with 'sk_live_' for realism
    api_key = f"sk_live_{secrets.token_urlsafe(32)}"
    
    new_tenant = Tenant(
        id=tenant_id,
        name=body.business_name,
        api_key=api_key,
        # Defaulting nomba credentials to None for now, relying on global ENV keys for MVP
    )
    db.add(new_tenant)
    await db.commit()
    await db.refresh(new_tenant)
    
    return SignupResponse(tenant_id=new_tenant.id, api_key=new_tenant.api_key)
