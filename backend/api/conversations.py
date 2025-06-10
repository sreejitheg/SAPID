from fastapi import APIRouter, Response
from pydantic import BaseModel

from core import db

router = APIRouter()


class ConversationIn(BaseModel):
    session_id: int


@router.post("/")
def create_conversation(payload: ConversationIn) -> dict:
    conv = db.create_conversation(payload.session_id)
    return {"id": conv.id, "session_id": conv.session_id, "created_at": conv.created_at}


@router.get("/")
def list_conversations(session_id: int | None = None) -> list[dict]:
    conversations = db.list_conversations(session_id)
    return [
        {"id": c.id, "session_id": c.session_id, "created_at": c.created_at}
        for c in conversations
    ]


@router.delete("/{conversation_id}", status_code=204)
def delete_conversation(conversation_id: int) -> Response:
    db.delete_conversation(conversation_id)
    return Response(status_code=204)


@router.get("/{conversation_id}/messages")
def get_messages(conversation_id: int) -> list[dict]:
    messages = db.get_messages(conversation_id)
    return [
        {
            "id": m.id,
            "conversation_id": m.conversation_id,
            "sender": m.sender,
            "content": m.content,
            "llm_intent": m.llm_intent,
            "confidence": m.confidence,
            "timestamp": m.timestamp,
        }
        for m in messages
    ]

