import os
import importlib
from httpx import AsyncClient
from sqlmodel import select
import pytest


@pytest.mark.asyncio
async def test_chat_flow(tmp_path, monkeypatch):
    os.environ['POSTGRES_URL'] = f"sqlite:///{tmp_path}/test.db"

    import backend.core.db as db
    db = importlib.reload(db)
    import backend.api.chat as chat
    chat = importlib.reload(chat)
    import backend.api.upload as upload
    upload = importlib.reload(upload)
    import backend.main as main
    main = importlib.reload(main)

    db.SQLModel.metadata.create_all(db.engine)

    monkeypatch.setattr(upload.rag, 'embed_pdf', lambda *args, **kwargs: None)
    monkeypatch.setattr(chat.rag, 'query', lambda *args, **kwargs: (
        'the answer', [{'doc_id': 'doc1', 'page': 0, 'chunk_id': 1}]
    ))
    monkeypatch.setattr(chat.llm, 'classify_intent', lambda text: ('general', 0.7))
    collect_calls = []
    monkeypatch.setattr(chat.incident_api, 'collect', lambda *a, **kw: collect_calls.append(a))

    session = db.get_or_create_session(None)

    pdf_path = 'frontend/public/demo/financial-report.pdf'

    async with AsyncClient(app=main.app, base_url='http://test') as client:
        with open(pdf_path, 'rb') as fh:
            resp = await client.post(f'/upload/temp/{session.id}', files={'file': ('test.pdf', fh, 'application/pdf')})
            assert resp.status_code == 200
        payload = {'session_id': session.id, 'user': 'alice', 'message': 'hello'}
        resp = await client.post('/chat/', json=payload)
        assert resp.status_code == 200
        data = resp.json()

    assert '(#/pdf/' in data['answer']

    with db.get_session() as s:
        msgs = s.exec(select(db.Message)).all()
        assert len(msgs) == 1
        assert msgs[0].content == 'hello'
