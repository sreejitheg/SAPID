import os
from fastapi import APIRouter

from sse_starlette.sse import EventSourceResponse
import json

from pydantic import BaseModel

from core.llm import LLM
from core.rag import RAG
from ..core import db
from ..external.incident_api import IncidentAPI

ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
chat_model = os.getenv("OLLAMA_CHAT_MODEL", "llama3")
embed_model = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")
chroma_url = os.getenv("CHROMA_URL", "http://localhost:8000")

llm = LLM(ollama_url, chat_model, embed_model)
rag = RAG(llm, chroma_url)
incident_api = IncidentAPI()

router = APIRouter()


class ChatIn(BaseModel):
    session_id: int | None = None

    conversation_id: int | None = None

    user: str
    message: str


def render_sources(sources: list[dict]) -> str:
    links = [
        f"[p{src.get('page')} \u00b6{src.get('chunk_id')}](#/pdf/{src.get('doc_id')}?p={src.get('page')}&c={src.get('chunk_id')})"
        for src in sources
    ]
    return "\n".join(links)


async def stream_chat(payload: ChatIn):
    session = db.get_or_create_session(payload.session_id)

    conversation = None
    if payload.conversation_id is not None:
        conversation = db.get_conversation(payload.conversation_id)
    if conversation is None:
        conversation = db.create_conversation(session.id)

    intent, conf = llm.classify_intent(payload.message)
    rag_ans, sources = rag.query(payload.message, f"temp_{session.id}", 5)
    if intent in {"incident_report", "maintenance_query"} and conf > 0.6:
        incident_api.collect(session.id, payload.message, intent)
    full_answer = rag_ans
    if sources:
        full_answer += "\n" + render_sources(sources)

    db.add_message(
        conversation_id=conversation.id,
        sender=payload.user,
        content=payload.message,
        llm_intent=intent,
        confidence=conf,
    )

    yield {"type": "content", "content": full_answer}
    for src in sources:
        doc_id = src.get("doc_id") if isinstance(src, dict) else getattr(src, "doc_id", None)
        if doc_id:
            yield {"type": "document_reference", "document_id": doc_id}
    yield {"type": "done"}


@router.post("/")
async def chat_endpoint(payload: ChatIn) -> EventSourceResponse:
    async def event_generator():
        async for chunk in stream_chat(payload):
            yield json.dumps(chunk)

    return EventSourceResponse(event_generator())

