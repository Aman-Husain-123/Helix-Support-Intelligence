from fastapi import WebSocket, WebSocketDisconnect, APIRouter
from typing import List, Dict
import json
import asyncio
from ..services.ai_service import generate_ai_response, get_embeddings
# Mocking a simple vector search for now
def mock_vector_search(query_embedding: List[float]):
    return [
        {"text": "Our Pro Plan costs $29/mo and includes unlimited API access.", "source": "pricing_faq.pdf"},
        {"text": "Helix Support Intelligence uses RAG to ground AI responses in your data.", "source": "product_overview.md"}
    ]

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
router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(user_id, websocket)
    history = []
    failed_attempts = 0 # for human escalation
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            user_query = message.get("text", "")
            
            # --- RAG Pipeline ---
            # 1. Embeddings (Mocked if no API key)
            try:
                # Actual code would use get_embeddings(user_query)
                # For demo purposes, we search context
                context_chunks = mock_vector_search([0.1]*1536) 
                context_str = "\n".join([c["text"] + f" (Source: {c['source']})" for c in context_chunks])
                
                # 2. Generate AI Response grounded in context
                # To avoid real API key requirement in demonstration mode, we'll mock response
                # But the code structure is correct.
                # ai_response = generate_ai_response(user_query, context_str, history)
                
                ai_response = f"I see you're asking about '{user_query}'. Based on our documentation, {context_chunks[0]['text']} [{context_chunks[0]['source']}]"
                
                # Update history
                history.append({"role": "user", "content": user_query})
                history.append({"role": "assistant", "content": ai_response})
                
                # Format response with source attribution
                payload = {
                    "text": ai_response,
                    "sources": [c["source"] for c in context_chunks],
                    "status": "success",
                    "type": "ai"
                }

                await websocket.send_text(json.dumps(payload))
                
                # Reset counter if success
                failed_attempts = 0

            except Exception as e:
                failed_attempts += 1
                error_response = {"text": f"Error: {str(e)}", "type": "error"}
                await websocket.send_text(json.dumps(error_response))
                
                if failed_attempts >= 3:
                    await websocket.send_text(json.dumps({
                        "text": "I'm having trouble finding the right answer. Would you like me to connect you with a human agent?",
                        "type": "escalation"
                    }))

    except WebSocketDisconnect:
        manager.disconnect(user_id)
