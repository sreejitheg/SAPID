import os
from pathlib import Path
import sys
import json
import pytest
from httpx import AsyncClient, ASGITransport

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

@pytest.mark.asyncio
async def test_endpoints(tmp_path, monkeypatch):
    os.environ['POSTGRES_URL'] = f"sqlite:///{tmp_path}/db.db"

    import core.rag as rag_module

    class DummyCollection:
        def add(self, *args, **kwargs):
            pass
        def query(self, *args, **kwargs):
            return {"documents": [[]], "metadatas": [[]]}

    class DummyClient:
        def get_or_create_collection(self, name):
            return DummyCollection()

    monkeypatch.setattr(rag_module, "chromadb", type("x", (), {"HttpClient": lambda *a, **k: DummyClient()})())

    import core.db as db
    import backend.api as backend_api
    import backend.api.chat as chat
    import backend.api.upload as upload
    import backend.api.sessions as sessions
    import backend.api.conversations as conversations
    import backend.api.forms as forms
    import backend.api.email as email
    sys.modules['api'] = backend_api
    import backend.main as main

    db.SQLModel.metadata.create_all(db.engine)

    monkeypatch.setattr(upload.rag, 'embed_pdf', lambda *a, **k: None)
    monkeypatch.setattr(chat.rag, 'query', lambda *a, **k: ('ans', []))
    monkeypatch.setattr(chat.llm, 'classify_intent', lambda t: ('general', 0.8))
    monkeypatch.setattr(email.email_service, 'send_email', lambda *a, **k: None)

    transport = ASGITransport(app=main.app)
    async with AsyncClient(transport=transport, base_url='http://test') as client:
        # create session
        sess = await client.post('/sessions/')
        assert sess.status_code == 200
        session_id = sess.json()['id']

        # create conversation
        conv = await client.post(
            '/conversations/', json={'session_id': session_id, 'title': 'Test'}
        )
        assert conv.status_code == 200
        conv_body = conv.json()
        assert conv_body['title'] == 'Test'
        conv_id = conv_body['id']

        # upload via generic endpoint
        pdf_path = 'frontend/public/demo/financial-report.pdf'
        with open(pdf_path, 'rb') as fh:
            up = await client.post(f'/upload/?type=temp&session_id={session_id}', files={'file': ('x.pdf', fh, 'application/pdf')})
            assert up.status_code == 200
            doc_id = up.json()['id']

        # also call /upload/temp endpoint
        with open(pdf_path, 'rb') as fh:
            resp = await client.post(f'/upload/temp/{session_id}', files={'file': ('y.pdf', fh, 'application/pdf')})
            assert resp.status_code == 200

        # list documents
        resp = await client.get(f'/upload/documents?session_id={session_id}')
        assert resp.status_code == 200
        assert len(resp.json()) == 1

        # get document
        resp = await client.get(f'/upload/documents/{doc_id}')
        assert resp.status_code == 200
        assert resp.json()['id'] == doc_id


        # form submit
        resp = await client.post('/forms/', json={'form_id':'f1','data':{'a':1},'session_id':session_id})
        assert resp.status_code == 200

        # email send
        resp = await client.post('/email/', json={'to':'a@test','subject':'s','body':'b','session_id':session_id})
        assert resp.status_code == 200

        # delete document
        resp = await client.delete(f'/upload/documents/{doc_id}')
        assert resp.status_code == 204

        # delete conversation
        resp = await client.delete(f'/conversations/{conv_id}')
        assert resp.status_code == 204

        # delete session
        resp = await client.delete(f'/sessions/{session_id}')
        assert resp.status_code == 204

        # health/demo
        assert (await client.get('/health')).status_code == 200
        assert (await client.get('/demo')).status_code == 200
