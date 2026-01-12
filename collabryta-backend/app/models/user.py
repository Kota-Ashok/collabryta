from sqlalchemy import Boolean, Column, Integer, String, Text, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean(), default=True)
    role = Column(String, default="Team Member")
    avatar = Column(Text, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    job_title = Column(String, nullable=True)
    status = Column(String, default="Offline")
    last_seen = Column(String, nullable=True)

    # Localization/Settings
    language = Column(String, default="English (US)")
    timezone = Column(String, default="(GMT+05:30) Mumbai, New Delhi")
    theme = Column(String, default="Neural")
    
    # Privacy
    show_online_status = Column(Boolean, default=True)
    share_local_time = Column(Boolean, default=True)
    anonymous_reporting = Column(Boolean, default=False)
    
    # Notifications (Email)
    email_summary = Column(Boolean, default=True)
    email_mentions = Column(Boolean, default=False)
    
    # Notifications (Push)
    push_chat = Column(Boolean, default=False)
    push_meetings = Column(Boolean, default=True)
    push_status = Column(Boolean, default=False)

    # Beta Features
    beta_ai_summaries = Column(Boolean, default=False)
    beta_voice_commands = Column(Boolean, default=True)
    beta_collab_editing = Column(Boolean, default=False)

    # Integrations (Stored as a list of connected service names)
    integrations = Column(JSON, default=list)

    # Security
    two_factor_enabled = Column(Boolean, default=False)
    
    files = relationship("File", back_populates="owner")
    
    hosted_meetings = relationship("Meeting", back_populates="host")
    attended_meetings = relationship("Meeting", secondary="meeting_participants", back_populates="participants")
    
    notifications = relationship("Notification", back_populates="user")
