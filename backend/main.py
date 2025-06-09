from fastapi import FastAPI

from api import chat, upload

app = FastAPI()

app.include_router(chat.router, prefix="/chat")
app.include_router(upload.router, prefix="/upload")

@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
