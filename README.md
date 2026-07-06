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

## Hackathon MVP Note: Authentication
For the purpose of this hackathon submission, we implemented a frictionless **API Key login** for the merchant dashboard rather than a traditional email/password authentication flow. 

**Why?** 
Building a production-ready auth service (JWT session management, password hashing, password resets) takes significant time. We chose to completely bypass generic authentication boilerplate so we could dedicate 100% of our 48 hours to building the actual core innovation: **the subscription orchestration engine on top of Nomba's APIs.** 

In a production environment, the web dashboard would utilize standard OAuth or JWT email login, and the API key would be strictly relegated to server-to-server API calls. For this demo, using the API key as the dashboard login token allows judges to instantly access the platform without having to verify fake emails.

## Structure
- `/backend`: Core FastAPI application and webhook listeners.
- `/docs`: Technical architecture and API reference (coming soon).

---