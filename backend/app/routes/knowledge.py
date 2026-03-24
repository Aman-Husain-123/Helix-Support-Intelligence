"""
Knowledge Base API Routes
Admin-only endpoints for:
- Collections CRUD
- Document upload (file) 
- Document ingestion (URL)
- Status tracking
- Soft delete
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel
from ..core.database import get_db, KnowledgeCollection, KnowledgeDocument
from ..core.security import require_role
from ..services.ingestion_service import ingest_file, ingest_url

router = APIRouter(prefix="/knowledge", tags=["knowledge"])

# ─────────── Schemas ───────────
class CollectionCreate(BaseModel):
    name: str
    description: Optional[str] = None

class CollectionResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    tenant_id: str
    is_deleted: bool

    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    id: int
    name: str
    source_type: str
    source_url: Optional[str]
    status: str
    error_message: Optional[str]
    version: int
    chunk_count: int
    collection_id: Optional[int]
    is_deleted: bool

    class Config:
        from_attributes = True

class IngestURLRequest(BaseModel):
    url: str
    name: str
    collection_id: Optional[int] = None

# ─────────── Collections ───────────

@router.post("/collections", response_model=CollectionResponse)
def create_collection(
    data: CollectionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin"]))
):
    coll = KnowledgeCollection(
        tenant_id=current_user.tenant_id,
        name=data.name,
        description=data.description
    )
    db.add(coll)
    db.commit()
    db.refresh(coll)
    return coll


@router.get("/collections", response_model=List[CollectionResponse])
def list_collections(
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "agent"]))
):
    return db.query(KnowledgeCollection).filter(
        KnowledgeCollection.tenant_id == current_user.tenant_id,
        KnowledgeCollection.is_deleted == False
    ).all()


@router.delete("/collections/{collection_id}")
def delete_collection(
    collection_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin"]))
):
    coll = db.query(KnowledgeCollection).filter(
        KnowledgeCollection.id == collection_id,
        KnowledgeCollection.tenant_id == current_user.tenant_id
    ).first()
    if not coll:
        raise HTTPException(status_code=404, detail="Collection not found")
    coll.is_deleted = True
    db.commit()
    return {"message": "Collection soft-deleted"}


# ─────────── Documents ───────────

@router.post("/documents/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    collection_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin"]))
):
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "txt"
    if ext not in ("pdf", "txt", "md"):
        raise HTTPException(status_code=400, detail="Only PDF, TXT, and MD files are supported")

    contents = await file.read()
    doc = KnowledgeDocument(
        tenant_id=current_user.tenant_id,
        collection_id=collection_id,
        name=file.filename,
        source_type=ext,
        status="pending"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Kick off async ingestion
    ingest_file(doc.id, contents, ext)
    return doc


@router.post("/documents/ingest-url", response_model=DocumentResponse)
def ingest_url_doc(
    data: IngestURLRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin"]))
):
    doc = KnowledgeDocument(
        tenant_id=current_user.tenant_id,
        collection_id=data.collection_id,
        name=data.name,
        source_type="url",
        source_url=data.url,
        status="pending"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    ingest_url(doc.id, data.url)
    return doc


@router.get("/documents", response_model=List[DocumentResponse])
def list_documents(
    collection_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "agent"]))
):
    q = db.query(KnowledgeDocument).filter(
        KnowledgeDocument.tenant_id == current_user.tenant_id,
        KnowledgeDocument.is_deleted == False
    )
    if collection_id:
        q = q.filter(KnowledgeDocument.collection_id == collection_id)
    return q.all()


@router.get("/documents/{doc_id}", response_model=DocumentResponse)
def get_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "agent"]))
):
    doc = db.query(KnowledgeDocument).filter(
        KnowledgeDocument.id == doc_id,
        KnowledgeDocument.tenant_id == current_user.tenant_id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.delete("/documents/{doc_id}")
def delete_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin"]))
):
    doc = db.query(KnowledgeDocument).filter(
        KnowledgeDocument.id == doc_id,
        KnowledgeDocument.tenant_id == current_user.tenant_id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc.is_deleted = True
    db.commit()
    return {"message": "Document soft-deleted"}
