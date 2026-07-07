import uuid
import secrets
import hashlib
import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from database import get_db
from models import Tenant

router = APIRouter(prefix="/auth", tags=["Auth"])

def hash_password(password: str) -> str:
    salt = os.urandom(16).hex()
    hashed = hashlib.sha256((password + salt).encode('utf-8')).hexdigest()
    return f"{salt}:{hashed}"

def verify_password(password: str, hashed_str: str) -> bool:
    if not hashed_str or ":" not in hashed_str:
        return False
    salt, original_hash = hashed_str.split(":", 1)
    new_hash = hashlib.sha256((password + salt).encode('utf-8')).hexdigest()
    return new_hash == original_hash

class SignupRequest(BaseModel):
    business_name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    tenant_id: str
    api_key: str
    name: str

@router.post("/signup", response_model=AuthResponse)
async def signup(body: SignupRequest, db: AsyncSession = Depends(get_db)):
    """Creates a new Tenant with email and password."""
    # Check if email exists
    result = await db.execute(select(Tenant).where(Tenant.email == body.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    tenant_id = str(uuid.uuid4())
    api_key = f"sk_live_{secrets.token_urlsafe(32)}"
    
    new_tenant = Tenant(
        id=tenant_id,
        name=body.business_name,
        email=body.email,
        password_hash=hash_password(body.password),
        api_key=api_key,
    )
    db.add(new_tenant)
    await db.commit()
    await db.refresh(new_tenant)
    
    return AuthResponse(tenant_id=new_tenant.id, api_key=new_tenant.api_key, name=new_tenant.name)

@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login with email and password to retrieve the API key."""
    result = await db.execute(select(Tenant).where(Tenant.email == body.email))
    tenant = result.scalar_one_or_none()
    
    if not tenant or not verify_password(body.password, tenant.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
        
    return AuthResponse(tenant_id=tenant.id, api_key=tenant.api_key, name=tenant.name)
