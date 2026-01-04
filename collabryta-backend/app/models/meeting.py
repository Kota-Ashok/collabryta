from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

# Association Table for Many-to-Many
meeting_participants = Table(
    'meeting_participants',
    Base.metadata,
    Column('meeting_id', Integer, ForeignKey('meetings.id'), primary_key=True),
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True)
)

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    location = Column(String, nullable=True) # e.g. "Conference Room A" or "Zoom"
    meeting_link = Column(String, nullable=True)
    
    host_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    host = relationship("User", back_populates="hosted_meetings")
    participants = relationship("User", secondary=meeting_participants, back_populates="attended_meetings")
