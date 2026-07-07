import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, BigInteger, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Tenant(Base):
    __tablename__ = "tenants"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=True)
    password_hash = Column(String, nullable=True)
    api_key = Column(String, unique=True, nullable=False)
    webhook_url = Column(String)
    nomba_secret = Column(String)
    nomba_account = Column(String)
    status = Column(String, default='active')
    created_at = Column(DateTime, default=datetime.utcnow)

    plans = relationship("Plan", back_populates="tenant", cascade="all, delete-orphan")
    customers = relationship("Customer", back_populates="tenant", cascade="all, delete-orphan")
    subscriptions = relationship("Subscription", back_populates="tenant", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="tenant", cascade="all, delete-orphan")


class Plan(Base):
    __tablename__ = "plans"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String)
    billing_model = Column(String, nullable=False)  # 'flat' | 'usage' | 'credit'
    base_amount = Column(BigInteger, default=0)     # in kobo
    interval = Column(String)                       # 'monthly' | 'annual'
    usage_limit = Column(Integer)
    overage_rate = Column(BigInteger)
    trial_days = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    metadata_ = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="plans")
    subscriptions = relationship("Subscription", back_populates="plan")

    @property
    def amount(self):
        return self.base_amount

    @property
    def currency(self):
        return "NGN"


class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    external_id = Column(String, nullable=False)
    email = Column(String)
    name = Column(String)
    nomba_token = Column(String)
    token_last4 = Column(String)
    token_brand = Column(String)
    token_expires = Column(String)
    credit_balance = Column(BigInteger, default=0)
    metadata_ = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="customers")
    subscriptions = relationship("Subscription", back_populates="customer")
    invoices = relationship("Invoice", back_populates="customer")


class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    plan_id = Column(String, ForeignKey("plans.id"), nullable=False)
    status = Column(String, nullable=False, default='incomplete')
    
    current_period_start = Column(DateTime)
    current_period_end = Column(DateTime)
    trial_ends_at = Column(DateTime)
    paused_at = Column(DateTime)
    resumed_at = Column(DateTime)
    cancelled_at = Column(DateTime)
    cancel_at_period_end = Column(Boolean, default=False)
    
    current_usage = Column(Integer, default=0)
    proration_credit = Column(BigInteger, default=0)
    metadata_ = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="subscriptions")
    customer = relationship("Customer", back_populates="subscriptions")
    plan = relationship("Plan", back_populates="subscriptions")
    invoices = relationship("Invoice", back_populates="subscription")


class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    subscription_id = Column(String, ForeignKey("subscriptions.id"))
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    
    amount = Column(BigInteger, nullable=False)
    overage_amount = Column(BigInteger, default=0)
    status = Column(String, nullable=False, default='open') # draft | open | paid | uncollectible
    
    attempt_count = Column(Integer, default=0)
    next_attempt_at = Column(DateTime)
    nomba_tx_ref = Column(String)
    nomba_session = Column(String, unique=True)
    
    paid_at = Column(DateTime)
    period_start = Column(DateTime)
    period_end = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="invoices")
    customer = relationship("Customer", back_populates="invoices")
    subscription = relationship("Subscription", back_populates="invoices")
    dunning_events = relationship("DunningEvent", back_populates="invoice")


class DunningEvent(Base):
    __tablename__ = "dunning_events"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    invoice_id = Column(String, ForeignKey("invoices.id"), nullable=False)
    subscription_id = Column(String, ForeignKey("subscriptions.id"), nullable=False)
    attempt_number = Column(Integer)
    result = Column(String)
    nomba_error = Column(String)
    next_retry_at = Column(DateTime)
    email_sent = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    invoice = relationship("Invoice", back_populates="dunning_events")
