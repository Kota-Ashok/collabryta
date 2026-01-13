from typing import List, Optional
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate
import json

def get_notifications(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Notification]:
    """Retrieves notifications for a user, filtering out those older than 24 hours."""
    now = datetime.now(timezone.utc)
    expiration_limit = now - timedelta(hours=24)
    
    return db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.created_at >= expiration_limit
    ).order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()

def get_unread_count(db: Session, user_id: int) -> int:
    """Returns the count of unread notifications for a user within the last 24 hours."""
    now = datetime.now(timezone.utc)
    expiration_limit = now - timedelta(hours=24)
    
    return db.query(Notification).filter(
        Notification.user_id == user_id, 
        Notification.is_read == False,
        Notification.created_at >= expiration_limit
    ).count()



async def create_notification(db: Session, notification: NotificationCreate) -> Notification:
    """Creates a new notification record."""
    db_notification = Notification(**notification.model_dump())
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    
    return db_notification

def mark_as_read(db: Session, notification_id: int) -> Optional[Notification]:
    """Marks a single notification as read."""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if notification:
        notification.is_read = True
        db.commit()
        db.refresh(notification)
    return notification

def mark_all_as_read(db: Session, user_id: int) -> None:
    """Marks all notifications for a user as read."""
    now = datetime.now(timezone.utc)
    expiration_limit = now - timedelta(hours=24)
    
    db.query(Notification).filter(
        Notification.user_id == user_id, 
        Notification.is_read == False,
        Notification.created_at >= expiration_limit
    ).update({Notification.is_read: True})
    db.commit()
