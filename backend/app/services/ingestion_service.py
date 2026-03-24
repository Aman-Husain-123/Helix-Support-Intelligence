"""
Knowledge Base Ingestion Service
Handles: PDF, TXT, MD file parsing + URL scraping
Pipeline: Parse → Chunk → (Embed via OpenAI) → Store vectors in memory/SQLite
"""
import io
import json
import hashlib
import threading
import logging
from typing import List, Optional
import requests
from bs4 import BeautifulSoup
from PyPDF2 import PdfReader
from sqlalchemy.orm import Session
from ..core.database import KnowledgeDocument, get_db
from ..core.config import settings

logger = logging.getLogger(__name__)

# In-memory vector store (replace with pgvector in production)
VECTOR_STORE: dict[str, list] = {}  # doc_id -> list of {"chunk": str, "embedding": list}

def _chunk_text(text: str, chunk_size: int = 500, overlap: int = 100) -> List[str]:
    """Split text into overlapping chunks."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return [c.strip() for c in chunks if c.strip()]


def _parse_pdf(file_bytes: bytes) -> str:
    """Extract text from a PDF file."""
    reader = PdfReader(io.BytesIO(file_bytes))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def _parse_text(file_bytes: bytes) -> str:
    """Decode plain text or markdown."""
    return file_bytes.decode("utf-8", errors="replace")


def _parse_url(url: str) -> str:
    """Scrape and extract readable text from a URL."""
    resp = requests.get(url, timeout=10, headers={"User-Agent": "HelixBot/1.0"})
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    # Remove scripts and styles
    for tag in soup(["script", "style", "nav", "footer"]):
        tag.decompose()
    return soup.get_text(separator="\n", strip=True)


def _get_embeddings(chunks: List[str]) -> List[List[float]]:
    """Generate embeddings via OpenAI. Falls back to mock if no API key."""
    if not settings.OPENAI_API_KEY:
        # Mock embeddings for local dev — random-ish float arrays based on content hash
        import hashlib
        result = []
        for chunk in chunks:
            h = int(hashlib.md5(chunk.encode()).hexdigest(), 16)
            vec = [(((h >> (i * 4)) & 0xF) / 15.0) for i in range(1536)]
            result.append(vec)
        return result

    from openai import OpenAI
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    resp = client.embeddings.create(
        model=settings.EMBEDDING_MODEL,
        input=chunks
    )
    return [item.embedding for item in resp.data]


def run_ingestion_pipeline(doc_id: int, text: str):
    """Background threaded ingestion: chunk → embed → store."""
    db: Session = next(get_db())
    doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == doc_id).first()
    if not doc:
        return

    try:
        doc.status = "processing"
        db.commit()

        chunks = _chunk_text(text)
        embeddings = _get_embeddings(chunks)

        # Store in memory vector store
        VECTOR_STORE[str(doc_id)] = [
            {"chunk": chunk, "embedding": emb}
            for chunk, emb in zip(chunks, embeddings)
        ]

        doc.status = "ready"
        doc.chunk_count = len(chunks)
        db.commit()
        logger.info(f"Document {doc_id} ingested: {len(chunks)} chunks")

    except Exception as e:
        logger.error(f"Ingestion failed for doc {doc_id}: {e}")
        doc.status = "failed"
        doc.error_message = str(e)
        db.commit()
    finally:
        db.close()


def ingest_file(doc_id: int, file_bytes: bytes, source_type: str):
    """Parse file and kick off background ingestion."""
    if source_type == "pdf":
        text = _parse_pdf(file_bytes)
    else:
        text = _parse_text(file_bytes)
    thread = threading.Thread(target=run_ingestion_pipeline, args=(doc_id, text), daemon=True)
    thread.start()


def ingest_url(doc_id: int, url: str):
    """Scrape URL and kick off background ingestion."""
    def _run():
        try:
            text = _parse_url(url)
            run_ingestion_pipeline(doc_id, text)
        except Exception as e:
            db = next(get_db())
            doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == doc_id).first()
            if doc:
                doc.status = "failed"
                doc.error_message = str(e)
                db.commit()
            db.close()

    thread = threading.Thread(target=_run, daemon=True)
    thread.start()


def vector_search(query_embedding: List[float], doc_ids: Optional[List[int]] = None, top_k: int = 5) -> List[dict]:
    """Simple cosine similarity search over the in-memory vector store."""
    import numpy as np

    results = []
    search_ids = [str(d) for d in doc_ids] if doc_ids else list(VECTOR_STORE.keys())

    q = np.array(query_embedding)
    q_norm = np.linalg.norm(q)

    for doc_id in search_ids:
        for entry in VECTOR_STORE.get(doc_id, []):
            v = np.array(entry["embedding"])
            score = float(np.dot(q, v) / (q_norm * np.linalg.norm(v) + 1e-9))
            results.append({"doc_id": doc_id, "chunk": entry["chunk"], "score": score})

    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:top_k]
