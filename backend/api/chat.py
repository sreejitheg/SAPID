from fastapi import APIRouter

router = APIRouter()

@router.post("/")
async def chat_endpoint(message: str) -> dict:
    return {"reply": f"Echo: {message}"}
