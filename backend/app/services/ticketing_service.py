from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..core.database import Ticket, Message, User
from typing import List, Optional

class TicketingService:
    @staticmethod
    def create_ticket(db: Session, tenant_id: str, customer_id: int, subject: str, description: str, priority: str = "medium") -> Ticket:
        # Determine SLA based on priority
        sla_hours = {"urgent": 4, "high": 12, "medium": 24, "low": 48}.get(priority, 24)
        sla_due_at = datetime.now(timezone.utc) + timedelta(hours=sla_hours)

        # 1. Create ticket object
        new_ticket = Ticket(
            tenant_id=tenant_id,
            customer_id=customer_id,
            subject=subject,
            description=description,
            priority=priority,
            status="open",
            sla_due_at=sla_due_at
        )

        # 2. Auto-assignment logic (fewest active tickets)
        # Find agents in the same tenant
        agents = db.query(User).filter(User.tenant_id == tenant_id, User.role == "agent", User.is_active == True).all()
        
        if agents:
            # Count active tickets per agent
            # We'll use a simple count for now. Ideally, this would be a single query.
            agent_loads = []
            for agent in agents:
                active_count = db.query(Ticket).filter(Ticket.assignee_id == agent.id, Ticket.status.in_(["open", "pending"])).count()
                agent_loads.append((agent, active_count))
            
            # Sort by load and pick the best one
            agent_loads.sort(key=lambda x: x[1])
            new_ticket.assignee_id = agent_loads[0][0].id

        db.add(new_ticket)
        db.commit()
        db.refresh(new_ticket)

        # 3. Create initial system message or description message
        if description:
            initial_msg = Message(
                ticket_id=new_ticket.id,
                sender_id=customer_id,
                sender_role="customer",
                content=description
            )
            db.add(initial_msg)
            db.commit()

        return new_ticket

    @staticmethod
    def add_message(db: Session, ticket_id: int, sender_id: int, sender_role: str, content: str) -> Message:
        ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
        if not ticket:
            raise ValueError("Ticket not found")

        new_message = Message(
            ticket_id=ticket_id,
            sender_id=sender_id,
            sender_role=sender_role,
            content=content
        )
        db.add(new_message)
        
        # If agent replies, set status to pending (awaiting customer)
        if sender_role == "agent" and ticket.status == "open":
            ticket.status = "pending"
        
        db.commit()
        db.refresh(new_message)
        return new_message

    @staticmethod
    def update_status(db: Session, ticket_id: int, new_status: str) -> Ticket:
        ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
        if not ticket:
            raise ValueError("Ticket not found")

        ticket.status = new_status
        if new_status in ["resolved", "closed"]:
            ticket.closed_at = datetime.now(timezone.utc)
        else:
            ticket.closed_at = None

        db.commit()
        db.refresh(ticket)
        return ticket

    @staticmethod
    def get_tenant_tickets(db: Session, tenant_id: str, status: Optional[str] = None) -> List[Ticket]:
        query = db.query(Ticket).filter(Ticket.tenant_id == tenant_id)
        if status:
            query = query.filter(Ticket.status == status)
        return query.order_by(Ticket.created_at.desc()).all()

    @staticmethod
    def get_customer_tickets(db: Session, customer_id: int) -> List[Ticket]:
        return db.query(Ticket).filter(Ticket.customer_id == customer_id).order_by(Ticket.created_at.desc()).all()
