from typing import Optional, List
from pydantic import BaseModel, EmailStr

# Shared properties
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    is_active: Optional[bool] = True
    role: Optional[str] = "Team Member"
    avatar: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    bio: Optional[str] = None
    job_title: Optional[str] = None
    status: Optional[str] = "Offline"
    last_seen: Optional[str] = None
    
    # Localization/Settings
    language: Optional[str] = "English (US)"
    timezone: Optional[str] = "(GMT+05:30) Mumbai, New Delhi"
    theme: Optional[str] = "Neural"
    
    # Privacy
    show_online_status: Optional[bool] = True
    share_local_time: Optional[bool] = True
    anonymous_reporting: Optional[bool] = False
    
    # Notifications (Email)
    email_tasks: Optional[bool] = True
    email_summary: Optional[bool] = True
    email_mentions: Optional[bool] = False
    
    # Notifications (Push)
    push_chat: Optional[bool] = False
    push_meetings: Optional[bool] = True
    push_status: Optional[bool] = False

    # Beta Features
    beta_ai_summaries: Optional[bool] = False
    beta_voice_commands: Optional[bool] = True
    beta_collab_editing: Optional[bool] = False

    # Integrations
    integrations: Optional[List[str]] = []

    # Security
    two_factor_enabled: Optional[bool] = False

# Properties to receive via API on creation
class UserCreate(UserBase):
    email: EmailStr
    password: str

# Properties to receive via API on update
class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: Optional[int] = None

    class Config:
        from_attributes = True

# Additional properties to return via API
class User(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    hashed_password: str
