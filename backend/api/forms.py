import json
from pydantic import BaseModel
from fastapi import APIRouter

from ..core import db

router = APIRouter()


class FormIn(BaseModel):
    form_id: str
    data: dict
    session_id: int


@router.post("/")
def submit_form(payload: FormIn) -> dict:
    db.add_form_submission(
        payload.form_id,
        payload.session_id,
        json.dumps(payload.data),
    )
    return {"status": "ok"}

