import os
import tempfile


from fastapi import APIRouter, UploadFile, HTTPException, Response
from fastapi.responses import FileResponse

from ..core.llm import LLM
from ..core.rag import RAG
from ..core import db


ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
chat_model = os.getenv("OLLAMA_CHAT_MODEL", "llama3")
embed_model = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")
chroma_url = os.getenv("CHROMA_URL", "http://localhost:8000")

rag = RAG(LLM(ollama_url, chat_model, embed_model), chroma_url)

router = APIRouter()


@router.post("/")
async def upload(file: UploadFile, type: str, session_id: int | None = None) -> dict:
    data = await file.read()
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(data)
        path = tmp.name

    if type == "global":
        collection = "global"
        is_temp = False
    else:
        if session_id is None:
            raise HTTPException(status_code=400, detail="session_id required for temporary documents")
        collection = f"temp_{session_id}"
        is_temp = True

    doc = db.add_document(file.filename, type, len(data), session_id)
    rag.embed_pdf(path, collection, is_temp, doc_id=str(doc.id))

    os.makedirs("./storage", exist_ok=True)
    storage_path = f"./storage/{doc.id}.pdf"
    os.replace(path, storage_path)

    return {"id": doc.id, "collection": collection, "url": f"/upload/documents/{doc.id}/view"}

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



@router.get("/documents")
def list_docs(session_id: int | None = None) -> list[dict]:
    docs = db.list_documents(session_id)
    return [
        {
            "id": d.id,
            "name": d.name,
            "type": d.type,
            "size": d.size,
            "uploaded_at": d.uploaded_at,
            "session_id": d.session_id,
        }
        for d in docs
    ]


@router.get("/documents/{doc_id}")
def get_doc(doc_id: int):
    doc = db.get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    return {
        "id": doc.id,
        "name": doc.name,
        "type": doc.type,
        "size": doc.size,
        "uploaded_at": doc.uploaded_at,
        "session_id": doc.session_id,
    }


@router.get("/documents/{doc_id}/view", response_class=FileResponse)
def view_pdf(doc_id: int):
    doc = db.get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    path = f"./storage/{doc_id}.pdf"
    return FileResponse(path, media_type="application/pdf", filename=doc.name)


@router.delete("/documents/{doc_id}", status_code=204)
def delete_doc(doc_id: int) -> Response:
    db.delete_document(doc_id)
    return Response(status_code=204)

