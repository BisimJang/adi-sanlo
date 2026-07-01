# Adi-Sanlo

**Bind. Pay. Go.**

Adi-Sanlo is a managed recurring billing API built on top of Nomba's payment primitives. It provides Nigerian developers — particularly those building AI SaaS and EdTech products — with a complete subscription infrastructure layer.

Built for the **DevCareer x Nomba Hackathon (Build Phase)**.

## Overview

Instead of manually orchestrating card tokenisation, webhook handling, cron jobs, and dunning logic, developers can integrate Adi-Sanlo to handle the entire subscription lifecycle. 

Adi-Sanlo supports:
- Flat-rate subscriptions
- Usage-based (metered) billing
- Credit packs
- Multiple payment methods (Tokenized Cards & Direct Debit Mandates)

## Tech Stack
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL (via SQLAlchemy)
- **Payment Provider**: Nomba API

## Structure
- `/backend`: Core FastAPI application and webhook listeners.
- `/docs`: Technical architecture and API reference (coming soon).

---