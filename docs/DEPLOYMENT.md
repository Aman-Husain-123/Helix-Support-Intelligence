# Euron Deployment Guide

This guide describes how to deploy the Euron support intelligence platform.

## Infrastructure Prerequisites

1.  **PostgreSQL with pgvector:** A managed database service (e.g., Supabase, RDS, DigitalOcean Managed DB).
2.  **Redis:** Needed for background task workers and temporary status storage.
3.  **API Keys:** OpenAI (for embeddings) and EURI AI (for LLM).
4.  **Hosting:** AWS ECS Fargate, Google Cloud Run, or a Kubernetes cluster.

## Environment Configuration

Create a `.env` file for the backend and a `.env.local` for the frontend.

### Backend `.env`
```env
# Database
DATABASE_URL=postgresql://user:pass@host:port/dbname
REDIS_URL=redis://localhost:6379/0

# AI Configuration
OPENAI_API_KEY=sk-proj-...
EMBEDDING_MODEL=text-embedding-3-small
LLM_MODEL=gpt-4o
VITE_EURI_API_KEY=euri-...
VITE_EURI_API_URL=https://api.euri.ai/v1/chat/completions

# Security
SECRET_KEY=yoursecretkeyhere
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://yourdomain.com/api/v1
NEXT_PUBLIC_WS_URL=ws://yourdomain.com/api/v1/chat/ws
```

## Backend Deployment (FastAPI)

1.  **Containerize:** Use the provided `Dockerfile`.
2.  **Run Migrations:** migrations should run automatically using SQLAlchemy's `create_all` during initialization or through Alembic if configured.
3.  **Command:** `uvicorn app.main:app --host 0.0.0.0 --port 8000`.

## Frontend Deployment (Next.js)

1.  **Build:** `npm run build`.
2.  **Static Files:** Serve from the `.next` directory or deploy to a Vercel/Netlify style provider.
3.  **Modern Setup:** Use the standalone mode for Docker-based hosting.

## Troubleshooting

-   **Database Access:** Ensure the instance security groups permit connections from your application.
-   **WebSocket Connectivity:** Ensure your load balancer (ALB) supports WebSocket/WSS protocols and doesn't timeout the connections.
-   **CORS Issues:** Add your production domain to the `allow_origins` list in `backend/app/main.py`.

---
*Generated: 2026-03-24*
