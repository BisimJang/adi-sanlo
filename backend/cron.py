import asyncio
import logging
import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from dateutil.relativedelta import relativedelta
from database import async_session_maker
from models import Subscription, Invoice, Customer, Plan, DunningEvent
from nomba_client import NombaClient
from routers.subscriptions import get_nomba_client

logger = logging.getLogger(__name__)

async def process_renewals():
    """
    Finds active subscriptions whose billing period has ended,
    attempts to charge the saved token, and handles success/failure.
    """
    logger.info("Running recurring billing engine...")
    
    async with async_session_maker() as db:
        now = datetime.utcnow()
        
        # 1. Find all active subscriptions that are due for renewal
        # (current_period_end is in the past)
        result = await db.execute(
            select(Subscription)
            .where(Subscription.status == "active")
            .where(Subscription.current_period_end <= now)
        )
        due_subscriptions = result.scalars().all()
        
        if not due_subscriptions:
            return
            
        nomba = get_nomba_client()
            
        for sub in due_subscriptions:
            try:
                # Fetch related data
                cust_res = await db.execute(select(Customer).where(Customer.id == sub.customer_id))
                customer = cust_res.scalar_one()
                
                plan_res = await db.execute(select(Plan).where(Plan.id == sub.plan_id))
                plan = plan_res.scalar_one()
                
                logger.info(f"Processing renewal for Subscription {sub.id} (Customer: {customer.email})")
                
                # Create a new invoice for this cycle
                invoice = Invoice(
                    id=str(uuid.uuid4()),
                    tenant_id=sub.tenant_id,
                    subscription_id=sub.id,
                    customer_id=customer.id,
                    amount=plan.base_amount,
                    status="open",
                    attempt_count=1,
                    period_start=sub.current_period_end,
                    # period_end is calculated on success
                )
                db.add(invoice)
                
                # Make the charge
                if not customer.nomba_token:
                    raise Exception("No saved card token for customer")
                    
                # Call Nomba's API (Live)
                # Amount is in Naira for Nomba
                charge_amount = plan.base_amount / 100
                
                try:
                    response = await nomba.charge_tokenized_card(
                        token=customer.nomba_token,
                        amount=charge_amount,
                        customer_email=customer.email
                    )
                    
                    # Assume success if no HTTP error
                    logger.info(f"Successfully charged token for Subscription {sub.id}")
                    
                    # Success Path
                    invoice.status = "paid"
                    invoice.paid_at = now
                    invoice.nomba_tx_ref = response.get("data", {}).get("transactionReference")
                    
                    # Advance period
                    sub.current_period_start = now
                    if plan.interval == "yearly":
                        sub.current_period_end = now + relativedelta(years=1)
                    else:
                        sub.current_period_end = now + relativedelta(months=1)
                        
                    invoice.period_end = sub.current_period_end
                    
                except Exception as e:
                    logger.error(f"Failed to charge token for Subscription {sub.id}: {str(e)}")
                    
                    # Failure Path - Dunning
                    sub.status = "past_due"
                    
                    dunning = DunningEvent(
                        id=str(uuid.uuid4()),
                        invoice_id=invoice.id,
                        subscription_id=sub.id,
                        attempt_number=1,
                        result="failed",
                        nomba_error=str(e),
                    )
                    db.add(dunning)
                
                await db.commit()
                
            except Exception as e:
                logger.error(f"Error processing subscription {sub.id}: {str(e)}")
                await db.rollback()

async def cron_loop():
    """Infinite loop to run the cron jobs"""
    logger.info("Auto-charge cron loop started.")
    while True:
        try:
            await process_renewals()
        except Exception as e:
            logger.error(f"Cron loop error: {str(e)}")
            
        # Run every 60 seconds
        await asyncio.sleep(60)
