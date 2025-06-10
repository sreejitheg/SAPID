from pydantic import BaseModel
from fastapi import APIRouter

from external.email_service import EmailService

router = APIRouter()
email_service = EmailService()


class EmailIn(BaseModel):
    to: str
    subject: str
    body: str
    session_id: int


@router.post("/")
def send_email(payload: EmailIn) -> dict:
    email_service.send_email(payload.to, payload.subject, payload.body, payload.session_id)
    return {"status": "ok"}
