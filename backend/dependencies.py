from fastapi import Depends, HTTPException, Security
from fastapi.security.api_key import APIKeyHeader
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models import Tenant

API_KEY_NAME = "Authorization"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

async def get_current_tenant(
    api_key_header: str = Security(api_key_header),
    db: AsyncSession = Depends(get_db)
) -> Tenant:
    if not api_key_header:
        raise HTTPException(status_code=401, detail="Missing API Key in Authorization header")
    
    # Strip 'Bearer ' if present
    api_key = api_key_header.replace("Bearer ", "").strip()
    
    result = await db.execute(select(Tenant).where(Tenant.api_key == api_key))
    tenant = result.scalar_one_or_none()
    
    if not tenant:
        raise HTTPException(status_code=401, detail="Invalid API Key")
        
    return tenant
