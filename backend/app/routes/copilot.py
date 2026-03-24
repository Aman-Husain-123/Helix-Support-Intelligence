from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db, User, Ticket
from ..core.security import require_role
from ..services.ai_service import AIService
from ..services.ingestion_service import vector_search

router = APIRouter(prefix="/copilot", tags=["copilot"])

@router.post("/suggest-reply")
def suggest_reply_ai(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["agent", "admin"]))
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # 1. Fetch relevant knowledge for better suggestions
    query_embedding = AIService.get_embeddings(ticket.description or "")
    knowledge_chunks = vector_search(query_embedding, tenant_id=current_user.tenant_id, top_k=3)
    
    # 2. Generate suggestion with history and knowledge
    suggestion = AIService.suggest_agent_reply(
        query=ticket.description or "",
        history=ticket.messages,
        knowledge_chunks=[c["text"] for c in knowledge_chunks]
    )
    return {"suggestion": suggestion, "sources": [c["source"] for c in knowledge_chunks]}

@router.post("/summarize")
def summarize_conversation(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["agent", "admin"]))
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    messages = ticket.messages
    summary = AIService.generate_ticket_summary(ticket.subject, ticket.description or "", messages)
    
    # Save the summary to the ticket if field exists
    if hasattr(ticket, 'ai_summary'):
        ticket.ai_summary = summary
        db.commit()
    
    return {"summary": summary, "ticket_id": ticket_id}

@router.post("/retrieve-kb")
def retrieve_kb_snippets(
    query: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["agent", "admin"]))
):
    """Direct knowledge base search for agents in the sidebar."""
    try:
        query_embedding = AIService.get_embeddings(query)
        results = vector_search(query_embedding, tenant_id=current_user.tenant_id, top_k=5)
        return {"query": query, "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
