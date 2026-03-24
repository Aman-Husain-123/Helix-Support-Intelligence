from fastapi import FastAPI, Depends, Request
import time
import uuid
from fastapi.middleware.cors import CORSMiddleware
from .routes.auth import router as auth_router
from .routes.chat import router as chat_router
from .routes.knowledge import router as knowledge_router
from .routes.ticketing import router as ticketing_router
from .core.security import require_role
from .core.database import User

app = FastAPI(title="Helix Support Intelligence API")

# Setup CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware: Request ID and Timing
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    request_id = str(uuid.uuid4())
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time"] = str(round(process_time * 1000, 2)) + "ms"
    return response

app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(knowledge_router)
app.include_router(ticketing_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Helix Support Intelligence API"}

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "2.0.0"}

@app.get("/api/agent/tickets", dependencies=[Depends(require_role(["agent", "admin"]))])
def get_agent_tickets(user: User = Depends(require_role(["agent", "admin"]))):
    return {"message": f"Welcome Agent! Here are tickets for tenant: {user.tenant_id}"}

@app.get("/api/admin/settings", dependencies=[Depends(require_role(["admin"]))])
def get_admin_settings(user: User = Depends(require_role(["admin"]))):
    return {"message": f"Welcome Admin! Settings for tenant: {user.tenant_id}"}

@app.get("/api/customer/chat", dependencies=[Depends(require_role(["customer", "admin", "agent"]))])
def get_customer_chat(user: User = Depends(require_role(["customer", "agent", "admin"]))):
    return {"message": f"Welcome Customer! Support chat for tenant: {user.tenant_id}"}
