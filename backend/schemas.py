from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum


# ─── Enums ────────────────────────────────────────────────────────────────────

class PlanInterval(str, Enum):
    monthly = "monthly"
    yearly = "yearly"

class SubscriptionStatus(str, Enum):
    incomplete = "incomplete"
    active = "active"
    past_due = "past_due"
    paused = "paused"
    cancelled = "cancelled"

class InvoiceStatus(str, Enum):
    pending = "pending"
    paid = "paid"
    failed = "failed"
    void = "void"


# ─── Plan ─────────────────────────────────────────────────────────────────────

class PlanCreate(BaseModel):
    name: str
    amount: float
    currency: str = "NGN"
    interval: PlanInterval = PlanInterval.monthly
    description: Optional[str] = None

class PlanResponse(BaseModel):
    id: str
    name: str
    amount: float
    currency: str
    interval: str
    description: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Customer ─────────────────────────────────────────────────────────────────

class CustomerCreate(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None

class CustomerResponse(BaseModel):
    id: str
    email: str
    name: str
    phone: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Subscription ─────────────────────────────────────────────────────────────

class SubscriptionCreate(BaseModel):
    plan_id: str
    customer_email: EmailStr
    customer_name: str
    customer_phone: Optional[str] = None
    callback_url: Optional[str] = None

class SubscriptionResponse(BaseModel):
    id: str
    status: str
    customer_id: str
    plan_id: str
    current_period_start: Optional[datetime]
    current_period_end: Optional[datetime]
    checkout_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Invoice ──────────────────────────────────────────────────────────────────

class InvoiceResponse(BaseModel):
    id: str
    subscription_id: str
    amount: float
    currency: str
    status: str
    attempt_count: int
    paid_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True
