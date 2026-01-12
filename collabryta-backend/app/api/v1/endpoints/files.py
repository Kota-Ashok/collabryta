from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db, get_current_user
from app.schemas.file import FileResponse
from app.services import file_service
from app.models.user import User

router = APIRouter()

@router.post("/upload", response_model=FileResponse)
async def upload_file(
    title: str = Form(...),
    description: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await file_service.upload_file(db, file, title, description or "", current_user.id)

@router.get("/", response_model=List[FileResponse])
def get_files(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return file_service.get_files(db, skip, limit)

@router.get("/my-files", response_model=List[FileResponse])
def get_my_files(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return file_service.get_user_files(db, current_user.id)
