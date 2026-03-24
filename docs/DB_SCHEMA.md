# Euron AI Database Schema

This document outlines the PostgreSQL database schema used by Euron AI (Helix Support Intelligence Implementation). All tables include a `tenant_id` for multi-tenant isolation.

## Tables

### 1. `users`
Stores identity and role-based access control details.
- `id` (Integer, PK): User identifier.
- `tenant_id` (String, Indexed): Multi-tenant isolation key.
- `email` (String, Unique, Indexed): User email.
- `hashed_password` (String): Securely hashed password.
- `role` (String): Role (`customer`, `agent`, `admin`).
- `is_active` (Boolean): Account status.

### 2. `knowledge_collections`
Groups related knowledge base documents.
- `id` (Integer, PK): Collection identifier.
- `tenant_id` (String, Indexed): Organization key.
- `name` (String): Display name.
- `description` (Text): Optional description.
- `created_at` (DateTime): Creation timestamp.
- `is_deleted` (Boolean): Soft-delete flag.

### 3. `knowledge_documents`
References source files or URLs in the knowledge base.
- `id` (Integer, PK): Document identifier.
- `tenant_id` (String, Indexed): Organization key.
- `collection_id` (Integer, FK): Optional link to a collection.
- `name` (String): Filename or URL title.
- `source_type` (String): Type (`pdf`, `txt`, `md`, `url`).
- `source_url` (String): Source URL for web-scraped content.
- `status` (String): Ingestion status (`pending`, `processing`, `ready`, `failed`).
- `chunk_count` (Integer): Number of chunks generated.
- `is_deleted` (Boolean): Soft-delete flag.

### 4. `knowledge_chunks`
Stores chunked text and vector embeddings for RAG retrieval.
- `id` (Integer, PK): Chunk identifier.
- `tenant_id` (String, Indexed): Organization key.
- `document_id` (Integer, FK): Reference to the parent document.
- `content` (Text): The raw text segment.
- `vector_json` (Text): Embedding vector stored as JSON string (or pgvector column).

### 5. `tickets`
The core support request entity.
- `id` (Integer, PK): Ticket serial ID.
- `tenant_id` (String, Indexed): Organization key.
- `customer_id` (Integer, FK): Optional link to a registered user.
- `customer_email` (String, Indexed): Email for non-registered users.
- `subject` (String): Ticket title.
- `description` (Text): Full issue description.
- `status` (String): Current status (`open`, `pending`, `resolved`, `closed`).
- `priority` (String): `low`, `medium`, `high`, `urgent`.
- `assignee_id` (Integer, FK): The agent assigned to the ticket.
- `ai_summary` (Text): AI-generated conversation summary.
- `sla_due_at` (DateTime): Deadline for response.
- `created_at`/`updated_at`: Standard timestamps.

### 6. `messages`
Individual communications within a ticket.
- `id` (Integer, PK): Message identifier.
- `ticket_id` (Integer, FK): The ticket this message belongs to.
- `sender_id` (Integer, FK): The user who sent the message.
- `sender_role` (String): `customer`, `agent`, or `ai`.
- `content` (Text): The message body.
- `created_at` (DateTime): Timestamp of message.

---
*Generated based on implementation in `backend/app/core/database.py`.*
