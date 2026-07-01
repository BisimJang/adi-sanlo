import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from models import Base, Tenant, Plan, Customer, Subscription, Invoice, DunningEvent

# Use an in-memory SQLite database for testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestingSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

@pytest_asyncio.fixture(scope="function")
async def db_session():
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with TestingSessionLocal() as session:
        yield session

    # Drop tables after test
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.mark.asyncio
async def test_create_tenant_and_customer(db_session: AsyncSession):
    # 1. Create Tenant
    tenant = Tenant(name="Stuudyverse", api_key="sk_test_123")
    db_session.add(tenant)
    await db_session.commit()
    
    assert tenant.id is not None
    assert tenant.status == 'active'

    # 2. Create Customer for that tenant
    customer = Customer(tenant_id=tenant.id, external_id="user_9921", email="emeka@example.com")
    db_session.add(customer)
    await db_session.commit()

    assert customer.id is not None
    assert customer.tenant_id == tenant.id

@pytest.mark.asyncio
async def test_create_full_subscription_flow(db_session: AsyncSession):
    # Create Tenant
    tenant = Tenant(name="Evnto", api_key="sk_test_456")
    db_session.add(tenant)
    await db_session.commit()

    # Create Plan
    plan = Plan(tenant_id=tenant.id, name="Pro", billing_model="flat", base_amount=500000)
    db_session.add(plan)
    
    # Create Customer
    customer = Customer(tenant_id=tenant.id, external_id="ev_user_1", name="Fatima")
    db_session.add(customer)
    await db_session.commit()

    # Create Subscription
    subscription = Subscription(
        tenant_id=tenant.id,
        customer_id=customer.id,
        plan_id=plan.id,
        status="active"
    )
    db_session.add(subscription)
    await db_session.commit()
    
    assert subscription.id is not None
    assert subscription.status == "active"

    # Create Invoice
    invoice = Invoice(
        tenant_id=tenant.id,
        subscription_id=subscription.id,
        customer_id=customer.id,
        amount=500000,
        status="open"
    )
    db_session.add(invoice)
    await db_session.commit()

    assert invoice.id is not None
    assert invoice.amount == 500000

    # Create DunningEvent
    dunning = DunningEvent(
        invoice_id=invoice.id,
        subscription_id=subscription.id,
        attempt_number=1,
        result="failed",
        nomba_error="insufficient_funds"
    )
    db_session.add(dunning)
    await db_session.commit()

    assert dunning.id is not None
    assert dunning.nomba_error == "insufficient_funds"
