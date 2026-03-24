from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class MessageCreate(BaseModel):
    content: str

class MessageResponse(BaseModel):
    id: int
    ticket_id: int
    sender_id: Optional[int]
    sender_role: str
    content: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class TicketCreate(BaseModel):
    subject: str
    description: str
    priority: str = "medium" # low, medium, high, urgent

class TicketStatusUpdate(BaseModel):
    status: str

class TicketResponse(BaseModel):
    id: int
    tenant_id: str
    customer_id: Optional[int]
    customer_email: Optional[str]
    subject: str
    description: Optional[str]
    status: str
    priority: str
    assignee_id: Optional[int]
    sla_due_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    closed_at: Optional[datetime]
    ai_summary: Optional[str]

    class Config:
        from_attributes = True

class DetailedTicketResponse(TicketResponse):
    messages: List[MessageResponse] = []
