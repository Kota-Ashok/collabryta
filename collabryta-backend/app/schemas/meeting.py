from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.schemas.user import User

class MeetingBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None
    meeting_link: Optional[str] = None

class MeetingCreate(MeetingBase):
    participant_ids: Optional[List[int]] = []

class MeetingUpdate(MeetingBase):
    title: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

class Meeting(MeetingBase):
    id: int
    host_id: int
    host: Optional[User] = None
    participants: List[User] = []

    class Config:
        from_attributes = True
