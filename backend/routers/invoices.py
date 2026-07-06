import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models import Invoice, Subscription, Customer, Plan, Tenant
from dependencies import get_current_tenant

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/invoices", tags=["Invoices"])


@router.get("")
async def list_invoices(
    status: str = None,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant)
):
    """List all invoices for this tenant, optionally filtered by status."""
    query = select(Invoice).where(Invoice.tenant_id == tenant.id)
    if status:
        query = query.where(Invoice.status == status)
    result = await db.execute(query.order_by(Invoice.created_at.desc()))
    return result.scalars().all()


@router.post("/{invoice_id}/retry")
async def retry_invoice(invoice_id: str, db: AsyncSession = Depends(get_db), tenant: Tenant = Depends(get_current_tenant)):
    """
    Manually retry a failed invoice.
    Charges the customer's saved card token via Nomba.
    """
    import os
    from nomba_client import NombaClient

    result = await db.execute(select(Invoice).where(Invoice.id == invoice_id, Invoice.tenant_id == tenant.id))
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if invoice.status not in ("failed", "pending"):
        raise HTTPException(status_code=400, detail="Only failed or pending invoices can be retried")

    # Get subscription -> customer -> card token
    result = await db.execute(select(Subscription).where(Subscription.id == invoice.subscription_id))
    subscription = result.scalar_one_or_none()

    result = await db.execute(select(Customer).where(Customer.id == subscription.customer_id))
    customer = result.scalar_one_or_none()

    if not customer.card_token:
        raise HTTPException(status_code=400, detail="No saved card token for this customer")

    # Attempt charge
    nomba = NombaClient(
        parent_account_id=os.getenv("NOMBA_ACCOUNT_ID"),
        sub_account_id=os.getenv("NOMBA_SUB_ACCOUNT_ID", "bb660a27-be50-48d5-991a-5ab223f9b3af"),
        client_id=os.getenv("NOMBA_CLIENT_ID"),
        client_secret=os.getenv("NOMBA_CLIENT_SECRET"),
    )

    try:
        response = await nomba.charge_tokenized_card(
            token=customer.card_token,
            amount=invoice.amount,
            customer_email=customer.email,
        )
        invoice.status = "paid"
        invoice.attempt_count += 1
        from datetime import datetime, timezone
        invoice.paid_at = datetime.now(timezone.utc)
        await db.commit()
        return {"status": "paid", "invoice_id": invoice_id, "response": response}
    except Exception as e:
        invoice.status = "failed"
        invoice.attempt_count += 1
        await db.commit()
        raise HTTPException(status_code=402, detail=f"Charge failed: {str(e)}")


@router.post("/{invoice_id}/void")
async def void_invoice(invoice_id: str, db: AsyncSession = Depends(get_db), tenant: Tenant = Depends(get_current_tenant)):
    """Void an open invoice."""
    result = await db.execute(select(Invoice).where(Invoice.id == invoice_id, Invoice.tenant_id == tenant.id))
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if invoice.status == "paid":
        raise HTTPException(status_code=400, detail="Cannot void a paid invoice")
    invoice.status = "void"
    await db.commit()
    return {"status": "void", "invoice_id": invoice_id}
