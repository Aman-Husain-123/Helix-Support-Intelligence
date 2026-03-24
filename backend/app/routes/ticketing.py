from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.database import get_db, User, Ticket
from ..core.security import get_current_user, require_role
from ..schemas.ticketing import TicketCreate, TicketResponse, DetailedTicketResponse, MessageCreate, MessageResponse, TicketStatusUpdate
from ..services.ticketing_service import TicketingService
from ..services.ai_service import AIService

router = APIRouter(prefix="/api/ticketing", tags=["ticketing"])

@router.post("/create", response_model=TicketResponse)
def create_ticket(
    ticket_data: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        new_ticket = TicketingService.create_ticket(
            db=db,
            tenant_id=current_user.tenant_id,
            customer_id=current_user.id,
            subject=ticket_data.subject,
            description=ticket_data.description,
            priority=ticket_data.priority
        )
        return new_ticket
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me", response_model=List[TicketResponse])
def get_my_tickets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return TicketingService.get_customer_tickets(db, current_user.id)

@router.get("/all", response_model=List[TicketResponse])
def get_all_tenant_tickets(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["agent", "admin"]))
):
    return TicketingService.get_tenant_tickets(db, current_user.tenant_id, status)

@router.get("/{ticket_id}", response_model=DetailedTicketResponse)
def get_ticket_details(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Check tenant isolation
    if ticket.tenant_id != current_user.tenant_id:
         raise HTTPException(status_code=403, detail="Forbidden")
    
    # Customer can only see their own tickets
    if current_user.role == "customer" and ticket.customer_id != current_user.id:
         raise HTTPException(status_code=403, detail="Forbidden")

    return ticket

@router.patch("/{ticket_id}/status", response_model=TicketResponse)
def update_ticket_status(
    ticket_id: int,
    update_data: TicketStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["agent", "admin"]))
):
    try:
        updated_ticket = TicketingService.update_status(db, ticket_id, update_data.status)
        return updated_ticket
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{ticket_id}/message", response_model=MessageResponse)
def add_ticket_message(
    ticket_id: int,
    message_data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        new_message = TicketingService.add_message(
            db=db,
            ticket_id=ticket_id,
            sender_id=current_user.id,
            sender_role=current_user.role,
            content=message_data.content
        )
        return new_message
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/{ticket_id}/summarize", response_model=TicketResponse)
def summarize_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["agent", "admin"]))
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    messages = ticket.messages
    summary = AIService.generate_ticket_summary(ticket.subject, ticket.description or "", messages)
    ticket.ai_summary = summary
    db.commit()
    db.refresh(ticket)
    return ticket
