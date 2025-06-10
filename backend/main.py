
from datetime import datetime
from fastapi import FastAPI

from api import chat, upload

from api import sessions
from api import conversations
from api import forms
from api import email


APP_VERSION = "1.0.0"


app = FastAPI()

app.include_router(chat.router, prefix="/chat")
app.include_router(upload.router, prefix="/upload")

app.include_router(sessions.router, prefix="/sessions")
app.include_router(conversations.router, prefix="/conversations")
app.include_router(forms.router, prefix="/forms")
app.include_router(email.router, prefix="/email")


@app.get("/health")
def health() -> dict:
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": APP_VERSION,
    }


@app.get("/demo")
def demo() -> dict:
    """Return mock data for demo mode."""
    return {
        "conversations": [
            {
                "id": "demo-1",
                "title": "Demo Conversation",
                "created_at": datetime.utcnow().isoformat() + "Z",
            }
        ],
        "documents": [
            {
                "id": "demo-doc",
                "name": "Demo.pdf",
                "type": "permanent",
                "size": 12345,
                "uploaded_at": datetime.utcnow().isoformat() + "Z",
                "url": "/demo/Demo.pdf",
            }
        ],
    }

