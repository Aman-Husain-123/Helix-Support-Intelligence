from fastapi import WebSocket, WebSocketDisconnect, APIRouter
from typing import List, Dict
import json
import asyncio
from ..core.database import get_db, User
from ..services.ai_service import AIService
from ..services.ingestion_service import vector_search

# Connection Manager for WebSockets
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

manager = ConnectionManager()
router = APIRouter(prefix="/chat", tags=["chat"])

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(user_id, websocket)
    db = next(get_db())
    # Identify tenant for RAG isolation
    try:
        user = db.query(User).filter(User.id == int(user_id) if user_id.isdigit() else 0).first()
        tenant_id = user.tenant_id if user else "default"
    except Exception:
        tenant_id = "default"
    finally:
        db.close()
    
    history = []
    failed_attempts = 0
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            user_query = message.get("text", "")
            
            # --- RAG Pipeline ---
            try:
                # 1. Embeddings & Search
                query_embedding = AIService.get_embeddings(user_query)
                context_chunks = vector_search(query_embedding, tenant_id=tenant_id)
                
                # 2. Generate response
                ai_output = AIService.generate_ai_response(user_query, context_chunks, history)
                ai_response = ai_output["text"]
                sources = ai_output["sources"]
                
                # Update history (keep last 10 turns)
                history.append({"role": "user", "content": user_query})
                history.append({"role": "assistant", "content": ai_response})
                history = history[-20:]
                
                payload = {
                    "text": ai_response,
                    "sources": sources,
                    "status": "success",
                    "type": "ai"
                }
                await websocket.send_text(json.dumps(payload))
                
                # Escalation check
                low_confidence_phrases = ["i don't know", "i'm not sure", "cannot help", "unable to assist", "contact support"]
                if any(p in ai_response.lower() for p in low_confidence_phrases):
                    failed_attempts += 1
                else:
                    failed_attempts = 0

            except Exception as e:
                failed_attempts += 1
                error_payload = {
                    "text": f"I'm having a moment — let me try to help differently. ({str(e)[:60]})",
                    "type": "error",
                    "status": "fail"
                }
                await websocket.send_text(json.dumps(error_payload))
                
            # Escalation after 3 failures
            if failed_attempts >= 3:
                await websocket.send_text(json.dumps({
                    "text": "It seems this query needs a human touch. I'm connecting you to an available agent now.",
                    "type": "escalation",
                    "action": "open_ticket"
                }))
                failed_attempts = 0

    except WebSocketDisconnect:
        manager.disconnect(user_id)

@router.post("/message")
async def rest_chat_fallback(request: dict):
    """REST API Fallback for when WebSocket is unavailable."""
    user_query = request.get("text", "")
    history = request.get("history", [])
    tenant_id = request.get("tenant_id", "default")
    
    query_embedding = AIService.get_embeddings(user_query)
    context_chunks = vector_search(query_embedding, tenant_id=tenant_id)
    ai_output = AIService.generate_ai_response(user_query, context_chunks, history)
    
    return {
        "text": ai_output["text"],
        "sources": ai_output["sources"],
        "type": "ai"
    }
