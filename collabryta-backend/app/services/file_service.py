from sqlalchemy.orm import Session
from fastapi import UploadFile
import aiofiles
import os

from datetime import datetime
from app.models.file import File
from app.schemas.file import FileCreate

UPLOAD_DIR = "app/static/uploads"

# Ensure directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)


async def upload_file(db: Session, file: UploadFile, title: str, description: str, user_id: int):
    # Create a unique filename to prevent overwrites (simple timestamp prefix)
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    clean_filename = f"{timestamp}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, clean_filename)

    # Save physical file
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()  # async read
        await out_file.write(content)
        
    file_size = len(content)

    # Determine file type
    # You might want a better mime-type check, but extension is a simple start
    ext = os.path.splitext(clean_filename)[1].lower()
    ftype = "Unknown"
    if ext in ['.pdf']: ftype = "PDF"
    elif ext in ['.xlsx', '.xls', '.csv']: ftype = "Spreadsheet"
    elif ext in ['.jpg', '.jpeg', '.png', '.svg']: ftype = "Image"
    elif ext in ['.mp4', '.mov']: ftype = "Video"
    
    db_file = File(
        filename=clean_filename,
        file_path=file_path,
        file_type=ftype,
        file_size_bytes=file_size,
        title=title,
        description=description,
        owner_id=user_id
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    
    from app.services import notification_service
    from app.schemas.notification import NotificationCreate
    
    await notification_service.create_notification(db, NotificationCreate(
        user_id=user_id,
        title="File Uploaded",
        description=f"File '{title}' uploaded successfully.",
        type="success"
    ))

    return db_file

def get_files(db: Session, skip: int = 0, limit: int = 100):
    return db.query(File).offset(skip).limit(limit).all()

def get_user_files(db: Session, user_id: int):
    return db.query(File).filter(File.owner_id == user_id).all()
