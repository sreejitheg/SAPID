from fastapi import FastAPI

from api import chat, upload
from api import sessions
from api import conversations
from api import forms
from api import email

app = FastAPI()

app.include_router(chat.router, prefix="/chat")
app.include_router(upload.router, prefix="/upload")
app.include_router(sessions.router, prefix="/sessions")
app.include_router(conversations.router, prefix="/conversations")
app.include_router(forms.router, prefix="/forms")
app.include_router(email.router, prefix="/email")

@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
