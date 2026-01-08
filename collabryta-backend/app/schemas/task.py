from typing import Optional
from datetime import datetime
from pydantic import BaseModel, field_validator
from .user import User

class TaskBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = "todo"
    priority: Optional[str] = "medium"
    due_date: Optional[datetime] = None
    assignee_id: Optional[int] = None

    @field_validator("due_date")
    @classmethod
    def validate_due_date(cls, v: Optional[datetime]) -> Optional[datetime]:
        if v:
            # Check if date is in the past (only date part for simplicity)
            now = datetime.now()
            if v.date() < now.date():
                raise ValueError("Due date cannot be in the past")
        return v

class TaskCreate(TaskBase):
    title: str

class TaskUpdate(TaskBase):
    pass

class TaskInDBBase(TaskBase):
    id: int
    created_at: datetime
    owner_id: int

    class Config:
        from_attributes = True

class Task(TaskInDBBase):
    owner: Optional[User] = None
    assignee: Optional[User] = None
