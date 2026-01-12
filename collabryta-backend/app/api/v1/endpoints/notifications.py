from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, models
from app.api import deps
from app.services import notification_service

router = APIRouter()

@router.get("/", response_model=List[schemas.Notification])
def read_notifications(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve notifications for current user.
    """
    return notification_service.get_notifications(db, user_id=current_user.id, skip=skip, limit=limit)

@router.put("/{id}/read", response_model=schemas.Notification)
def mark_notification_read(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Mark notification as read.
    """
    # Verify ownership
    notification = db.query(models.Notification).filter(models.Notification.id == id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    return notification_service.mark_as_read(db, notification_id=id)

@router.put("/read-all", response_model=Any)
def mark_all_read(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Mark all notifications as read.
    """
    notification_service.mark_all_as_read(db, user_id=current_user.id)
    return {"message": "All notifications marked as read"}
