# Euron — AI-Powered Customer Support Platform

Euron is a full-stack, AI-powered customer support SaaS platform that combines a RAG-based chatbot, smart ticketing, knowledge base management, agent copilot, and an admin panel into a single professional application.

Built with **Next.js 14**, **FastAPI**, **Supabase (PostgreSQL + pgvector)**, and the **EURI AI API** (OpenAI-compatible).

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Frontend Routes](#frontend-routes)
- [Testing](#testing)
- [Design System](#design-system)
- [Database Schema](#database-schema)
- [Key Flows](#key-flows)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### 1. Authentication & Role-Based Access Control

- Email/password signup and login with **bcrypt** password hashing
- **JWT tokens** — access tokens (60 min) + refresh tokens (7 days)
- Three roles with distinct permissions:
  - **Customer** — chat with AI, create/view tickets, browse help center
  - **Agent** — manage assigned tickets, use AI copilot, handle escalations
  - **Admin** — manage agents, configure AI, upload knowledge base, view analytics
- Role-based frontend routing via `useUser()` hook
- Role-based API protection via `require_role()` FastAPI dependency
- Multi-tenant isolation with `tenant_id` on all queries

### 2. AI Chatbot with RAG (Retrieval-Augmented Generation)

- Real-time chat via **WebSocket** with automatic reconnection
- REST API fallback when WebSocket is unavailable
- Full RAG pipeline:
  1. User message is embedded via OpenAI Embedding API
  2. pgvector similarity search finds top-K relevant knowledge base chunks
  3. Context assembled with source citations
  4. System prompt + KB context + conversation history sent to EURI LLM
  5. AI response returned with citation metadata
- Source attribution — each AI response shows which KB documents were referenced
- Automatic escalation to human agent after 3 AI attempts
- Typing indicator and auto-scroll
- Conversation history persistence

### 3. Knowledge Base Management

- **Document upload** — PDF, TXT, MD files via multipart form upload
- **URL ingestion** — ingest content from external URLs (Implemented)
- **Ingestion pipeline** (async worker):
  1. Parse PDF text (pypdf)
  2. Chunk text into overlapping segments (configurable chunk size and overlap)
  3. Generate embedding vectors via OpenAI/EURI API
  4. Store chunks + vectors in `knowledge_chunks` table (pgvector)
  5. Status tracking: `pending` → `processing` → `ready` / `failed`
- **Collection management** — organize documents into named collections
- **Admin UI** — document table with status badges, chunk counts, version tracking, delete capability
- Soft-delete support (documents are marked as deleted, chunks are hard-deleted)

### 4. Smart Ticketing System

- **Create tickets** with subject, description, and priority (low/medium/high/urgent)
- **Auto-assignment** — new tickets are automatically assigned to the available agent with the fewest active tickets (round-robin load balancing)
- **Status management** — open → pending → resolved → closed, with automatic `closed_at` timestamp
- **Message threads** — customers and agents can exchange messages on each ticket
- **AI summaries** — tickets can display AI-generated summaries
- **SLA tracking** — `sla_due_at` field for deadline visibility
- **Filterable lists** — filter by status with tab-based UI
- **Ticket detail view** — two-column layout with conversation, status actions, customer/agent info

### 5. Agent Copilot (Separate Router)

- **Suggest Reply** — generates professional agent responses using:
  - last 10 conversation messages for context
  - top 3 KB chunks via RAG retrieval
  - EURI LLM generates tailored reply
  - Response populates the reply textarea for review/edit before sending
- **Summarize** — generates ticket/conversation summaries with key bullet points from up to 30 messages
- **KB Retrieval** — direct knowledge base search returning relevant snippets with relevance scores
- Available on ticket detail page and agent tickets page with slide-out copilot panel

### 6. Admin Panel

- **Agent Management** — view all agents in a table with:
  - Status filter (available/busy/offline)
  - Edit modal to update status, skills (comma-separated), max concurrent tickets
  - Active ticket count per agent
- **AI Configuration** — configure the AI model:
  - Model selection (gpt-4o-mini, gpt-4o, gpt-4-turbo, gpt-3.5-turbo)
  - Temperature slider (0.0–2.0)
  - Max tokens input (256–8192)
  - System prompt textarea
  - In-memory storage for MVP (persists per server lifecycle)
- **Knowledge Base** — full document management (see section 3)
- **Settings** — general settings display, API keys section, security status indicators

### 7. Analytics Dashboard

- **Admin dashboard** with 4 stat cards:
  - Open Tickets (with total count)
  - Active Conversations
  - Average Resolution Time (hours)
  - AI Resolution Rate (percentage)
- **Recent tickets** list with priority indicators and status badges
- **Quick stats** sidebar with CSAT score
- **Extended analytics page** with real metrics computed from system data.

### 8. Agent Interface

- **Agent Dashboard** — personal stats, assigned tickets, quick actions, escalation alerts
- **Agent Inbox** — two-column chat interface:
  - Left panel: conversation list with customer names, message previews, unread counts, escalation indicators
  - Right panel: active conversation with message thread, reply box, AI suggest button
- **Agent Tickets** — assigned ticket list with status filter tabs and copilot side panel

### 9. Customer Interface

- **Chat** — main support channel with AI assistant (see section 2)
- **Tickets** — view all tickets, create new tickets, view ticket details with message threads
- **Help Center** — browseable knowledge base collections (Getting Started, Account & Billing, Troubleshooting) with search and popular articles

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Clients                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐   │
│  │  Admin   │  │  Agent   │  │     Customer          │   │
│  │  /admin  │  │  /agent  │  │  /chat /tickets /help │   │
│  └────┬─────┘  └────┬─────┘  └──────────┬───────────┘   │
└───────┼──────────────┼──────────────────┼────────────────┘
        │              │                  │
        └──────────────┼──────────────────┘
                       │
              ┌────────▼────────┐
              │   Next.js App   │
              │   (16 routes)   │
              │   Port 3000     │
              └────────┬────────┘
                       │ HTTP / WebSocket
              ┌────────▼────────┐
              │  FastAPI Backend │
              │  (api/v1 prefix) │
              │   Port 8000     │
              └────────┬────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
  ┌─────▼─────┐  ┌────▼────┐  ┌─────▼─────┐
  │  Supabase │  │  Redis  │  │ EURI API  │
  │ PostgreSQL│  │ (cache) │  │ (LLM +    │
  │ + pgvector│  │         │  │ embeddings│
  └───────────┘  └─────────┘  └───────────┘
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js (App Router) | 14.x |
| | React | 18.x |
| | TypeScript (strict mode) | 5.x |
| | Tailwind CSS | 3.4+ |
| | Lucide React (icons) | Latest |
| **Backend** | Python | 3.11+ |
| | FastAPI | 0.115+ |
| | Pydantic v2 | 2.10+ |
| | python-jose (JWT) | 3.3+ |
| | passlib[bcrypt] | 1.7+ |
| **Database** | Supabase (PostgreSQL + pgvector) | Latest |
| **Cache** | Redis | 5.2+ |
| **AI** | EURI API (OpenAI-compatible) | OpenAI SDK 1.x |
| **PDF Parsing** | pypdf | 5.0+ |

---

## Project Structure

```
euron/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI entry point
│   │   ├── core/                       # Config, security, database models
│   │   ├── routes/                     # v1 versioned routes (auth, chat, ticketing, copilot, etc.)
│   │   ├── services/                   # Service modules (business logic + AI)
│   │   ├── repositories/              # Repository modules (data access)
│   │   ├── schemas/                    # Pydantic schema modules
│   │   ├── integration/               # Supabase, OpenAI, Redis clients
│   │   ├── workers/                    # Ingestion pipeline worker
│   ├── requirements.txt
├── frontend/
│   ├── app/                            # 16 Next.js pages
│   │   ├── login/ & signup/            # Auth pages
│   │   ├── chat/                       # AI chatbot
│   │   ├── tickets/ & tickets/[id]/    # Ticket list & detail
│   │   ├── help/                       # Help center
│   │   ├── admin/                      # Dashboard, knowledge, agents, analytics
│   │   └── agent/                      # Dashboard, inbox, tickets
│   ├── components/                     # UI primitives + domain components
│   ├── hooks/                          # useAuth, useUser, useChat, useWebSocket
├── docs/                               # DB Schema, Deployment docs
├── README.md
```

---

## Getting Started

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate
pip install -r requirements.txt
# Configure .env
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## API Reference

Base URL: `http://localhost:8000/api/v1`

### Auth

- `POST /auth/signup`: Register user
- `POST /auth/login`: Authenticate and get JWT
- `GET /auth/me`: Get current user info

### Ticketing

- `GET /ticketing/me`: My tickets (customer)
- `GET /ticketing/all`: All tickets (agent/admin)
- `POST /ticketing/create`: New ticket
- `PATCH /ticketing/{id}/status`: Change status
- `POST /ticketing/{id}/message`: Add message to thread

### Copilot

- `POST /copilot/suggest-reply?ticket_id={id}`: Get AI reply suggestion
- `POST /copilot/summarize?ticket_id={id}`: Generate AI ticket summary

### Chat

- `WS /chat/ws/{user_id}`: Real-time RAG-supported AI chat

---

## Documentation

- [Database Schema](docs/DB_SCHEMA.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

---

Built with [FastAPI](https://fastapi.tiangolo.com/), [Next.js](https://nextjs.org/), [Supabase](https://supabase.com/), and [EURI AI](https://euri.ai/).
