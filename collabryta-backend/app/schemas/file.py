from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class FileBase(BaseModel):
    title: str
    description: Optional[str] = None

class FileCreate(FileBase):
    pass

class FileResponse(FileBase):
    id: int
    filename: str
    file_path: str
    file_type: Optional[str] = None
    file_size_bytes: int
    uploaded_at: datetime
    owner_id: int

    class Config:
        from_attributes = True
