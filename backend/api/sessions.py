from datetime import datetime
from fastapi import APIRouter, Response

from ..core import db

router = APIRouter()


@router.post("/")
def create_session() -> dict:
    session = db.create_session()
    return {"id": session.id, "created_at": session.created_at}


@router.delete("/{session_id}", status_code=204)
def delete_session(session_id: int) -> Response:
    db.delete_session(session_id)
    return Response(status_code=204)
