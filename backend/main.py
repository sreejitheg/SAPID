from fastapi import FastAPI

from api import chat, upload
from api import sessions

app = FastAPI()

app.include_router(chat.router, prefix="/chat")
app.include_router(upload.router, prefix="/upload")
app.include_router(sessions.router, prefix="/sessions")

@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
