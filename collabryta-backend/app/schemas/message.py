from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from .user import User

class MessageBase(BaseModel):
    content: str

class MessageCreate(MessageBase):
    pass # content is enough, chat_id via path

class MessageResponse(MessageBase):
    id: int
    chat_id: int
    sender_id: int
    sender: Optional[User] = None
    timestamp: datetime
    is_read: bool

    class Config:
        from_attributes = True

class ChatBase(BaseModel):
    name: Optional[str] = None
    is_group: bool = False

class ChatCreate(ChatBase):
    participant_ids: List[int]

class ChatResponse(ChatBase):
    id: int
    created_at: datetime
    participants: List[User] = []
    last_message: Optional[MessageResponse] = None

    class Config:
        from_attributes = True
