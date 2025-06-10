from io import BytesIO

import requests
from pypdf import PdfWriter
from sqlmodel import select

from backend.core import db


def test_smoke_gpu():
    writer = PdfWriter()
    writer.add_blank_page(width=72, height=72)
    buf = BytesIO()
    writer.write(buf)
    buf.seek(0)

    resp = requests.post(
        "http://localhost:8001/upload/global",
        files={"file": ("dummy.pdf", buf, "application/pdf")},
    )
    assert resp.status_code == 200

    sess_resp = requests.post("http://localhost:8001/sessions")
    assert sess_resp.status_code == 200
    session_id = sess_resp.json()["id"]

    payload = {
        "session_id": session_id,
        "user": "tester",
        "message": "What is in the doc?",
    }
    conv_resp = requests.post(
        "http://localhost:8001/conversations",
        json={"session_id": session_id},
    )
    assert conv_resp.status_code == 200
    conv_id = conv_resp.json()["id"]
    payload["conversation_id"] = conv_id
    resp = requests.post("http://localhost:8001/chat/", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "(#/pdf/" in data.get("answer", "")
    assert data.get("intent") in {"general", "document_query"}

    with db.get_session() as session:
        msgs = session.exec(select(db.ChatMessage)).all()
        assert len(msgs) >= 1
