from fastapi import APIRouter, UploadFile

router = APIRouter()

@router.post("/")
async def upload_file(file: UploadFile) -> dict:
    return {"filename": file.filename}
