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

    payload = {
        "session_id": "gpu-test",
        "user": "tester",
        "message": "What is in the doc?",
    }
    resp = requests.post("http://localhost:8001/chat/", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "(#/pdf/" in data.get("answer", "")
    assert data.get("intent") in {"general", "document_query"}

    with db.get_session() as session:
        msgs = session.exec(select(db.Message)).all()
        assert len(msgs) >= 1
