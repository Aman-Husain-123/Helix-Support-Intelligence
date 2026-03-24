from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from .config import settings

engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # customer, agent, admin
    is_active = Column(Boolean, default=True)

class KnowledgeCollection(Base):
    __tablename__ = "knowledge_collections"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, index=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_deleted = Column(Boolean, default=False)
    documents = relationship("KnowledgeDocument", back_populates="collection")

class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, index=True, nullable=False)
    collection_id = Column(Integer, ForeignKey("knowledge_collections.id"), nullable=True)
    name = Column(String, nullable=False)
    source_type = Column(String, nullable=False)  # pdf, txt, md, url
    source_url = Column(String, nullable=True)     # populated for URL ingestions
    status = Column(String, default="pending")     # pending, processing, ready, failed
    error_message = Column(Text, nullable=True)
    version = Column(Integer, default=1)
    chunk_count = Column(Integer, default=0)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    collection = relationship("KnowledgeCollection", back_populates="documents")

class Ticket(Base):
    __tablename__ = "tickets"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Could be a registered user
    customer_email = Column(String, index=True) # Or just an email
    subject = Column(String, nullable=False)
    status = Column(String, default="open") # open, in_progress, resolved, closed
    priority = Column(String, default="medium") # low, medium, high, urgent
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    assignee = relationship("User", foreign_keys=[assignee_id])
    messages = relationship("Message", back_populates="ticket")

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Agent or customer
    sender_role = Column(String) # customer, agent, ai
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    ticket = relationship("Ticket", back_populates="messages")

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
