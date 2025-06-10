import os
import json

from pathlib import Path
import sys
from httpx import AsyncClient, ASGITransport
from sqlmodel import select
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))



@pytest.mark.asyncio
async def test_chat_flow(tmp_path, monkeypatch):
    os.environ['POSTGRES_URL'] = f"sqlite:///{tmp_path}/test.db"


    import backend.core.rag as rag_module

    class DummyCollection:
        def add(self, *args, **kwargs):
            pass

        def query(self, *args, **kwargs):
            return {"documents": [[]], "metadatas": [[]]}

    class DummyClient:
        def get_or_create_collection(self, name):
            return DummyCollection()

    monkeypatch.setattr(rag_module, "chromadb", type("x", (), {"HttpClient": lambda *a, **k: DummyClient()})())

    import backend.core.db as db
    import backend.api as backend_api
    import backend.api.chat as chat
    import backend.api.upload as upload
    sys.modules['api'] = backend_api
    import backend.main as main

        async with client.stream("POST", "/chat/", json=payload) as resp:
            assert resp.status_code == 200
            events = []
            async for line in resp.aiter_lines():
                if line.startswith("data:"):
                    events.append(json.loads(line[5:].strip()))

            answer = "".join(e["content"] for e in events if e.get("type") == "content")
    assert '(#/pdf/' in answer
        'the answer', [{'doc_id': 'doc1', 'page': 0, 'chunk_id': 1}]
    ))
    monkeypatch.setattr(chat.llm, 'classify_intent', lambda text: ('general', 0.7))
    collect_calls = []

    import backend.external.incident_api as incident_mod
    monkeypatch.setattr(incident_mod.IncidentAPI, 'collect', lambda self, *a, **kw: collect_calls.append(a))

    session = db.get_or_create_session(None)
    conv = db.create_conversation(session.id)


    pdf_path = 'frontend/public/demo/financial-report.pdf'

    transport = ASGITransport(app=main.app)
    async with AsyncClient(transport=transport, base_url='http://test') as client:

        with open(pdf_path, 'rb') as fh:
            resp = await client.post(f'/upload/temp/{session.id}', files={'file': ('test.pdf', fh, 'application/pdf')})
            assert resp.status_code == 200
        payload = {
            'session_id': session.id,
            'conversation_id': conv.id,
            'user': 'alice',
            'message': 'hello'
        }

        resp = await client.post('/chat/', json=payload)
        assert resp.status_code == 200
        data = resp.json()

    assert '(#/pdf/' in data['answer']

    with db.get_session() as s:

        msgs = s.exec(select(db.ChatMessage)).all()

        assert len(msgs) == 1
        assert msgs[0].content == 'hello'
