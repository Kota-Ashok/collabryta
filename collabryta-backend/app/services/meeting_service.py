from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.meeting import Meeting
from app.models.user import User
from app.schemas.meeting import MeetingCreate, MeetingUpdate

def get_meeting(db: Session, meeting_id: int) -> Optional[Meeting]:
    return db.query(Meeting).filter(Meeting.id == meeting_id).first()

def get_user_meetings(db: Session, user_id: int, recent_only: bool = False) -> List[Meeting]:
    # Return meetings where user is host OR participant
    query = db.query(Meeting).filter(
        or_(
            Meeting.host_id == user_id,
            Meeting.participants.any(id=user_id)
        )
    )
    
    if recent_only:
        threshold = datetime.now() - timedelta(hours=48)
        query = query.filter(Meeting.end_time >= threshold)

    meetings = query.order_by(Meeting.start_time).all()
    return meetings



async def create_meeting(db: Session, meeting_in: MeetingCreate, host_id: int) -> Meeting:
    # 1. Create meeting object
    db_meeting = Meeting(
        title=meeting_in.title,
        description=meeting_in.description,
        start_time=meeting_in.start_time,
        end_time=meeting_in.end_time,
        location=meeting_in.location,
        meeting_link=meeting_in.meeting_link,
        host_id=host_id
    )
    
    # 2. Add participants
    if meeting_in.participant_ids:
        participants = db.query(User).filter(User.id.in_(meeting_in.participant_ids)).all()
        db_meeting.participants = participants
        
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    
    # Notify Host
    from app.services import notification_service
    from app.schemas.notification import NotificationCreate
    
    await notification_service.create_notification(db, NotificationCreate(
        user_id=host_id,
        title="Meeting Scheduled",
        description=f"Meeting '{db_meeting.title}' scheduled successfully.",
        type="success"
    ))
    
    # Notify Participants
    for participant in db_meeting.participants:
        if participant.id != host_id:
             await notification_service.create_notification(db, NotificationCreate(
                user_id=participant.id,
                title="New Meeting Invitation",
                description=f"You have been invited to '{db_meeting.title}' by {db_meeting.host.name if db_meeting.host else 'Host'}.",
                type="info"
            ))

    return db_meeting

def delete_meeting(db: Session, meeting_id: int) -> Optional[Meeting]:
    meeting = get_meeting(db, meeting_id)
    if meeting:
        db.delete(meeting)
        db.commit()
    return meeting
