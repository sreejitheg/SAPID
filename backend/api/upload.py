import os
import tempfile

from fastapi import APIRouter, UploadFile

from ..core.llm import LLM
from ..core.rag import RAG

ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
chat_model = os.getenv("OLLAMA_CHAT_MODEL", "llama3")
embed_model = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")
chroma_url = os.getenv("CHROMA_URL", "http://localhost:8000")

rag = RAG(LLM(ollama_url, chat_model, embed_model), chroma_url)

router = APIRouter()

@router.post("/global")
async def upload_global(file: UploadFile) -> dict:
    """Upload a PDF to the global knowledge base."""
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(await file.read())
        path = tmp.name

    rag.embed_pdf(path, "global", is_temp=False)
    return {"status": "ok", "collection": "global"}


@router.post("/temp/{session_id}")
async def upload_temp(session_id: int, file: UploadFile) -> dict:
    """Upload a PDF to a session-scoped temporary collection."""
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(await file.read())
        path = tmp.name

    collection = f"temp_{session_id}"
    rag.embed_pdf(path, collection, is_temp=True)
    return {"status": "ok", "collection": collection}

