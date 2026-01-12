from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, models
from app.api import deps
from app.services import meeting_service

router = APIRouter()

@router.get("/", response_model=List[schemas.Meeting])
def read_meetings(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    recent_only: bool = True
) -> Any:
    """
    Retrieve meetings for current user (hosted + attended).
    """
    return meeting_service.get_user_meetings(db, user_id=current_user.id, recent_only=recent_only)

@router.post("/", response_model=schemas.Meeting)
async def create_meeting(
    *,
    db: Session = Depends(deps.get_db),
    meeting_in: schemas.MeetingCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new meeting.
    """
    return await meeting_service.create_meeting(db, meeting_in=meeting_in, host_id=current_user.id)

@router.delete("/{id}", response_model=schemas.Meeting)
def delete_meeting(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete meeting.
    """
    meeting = meeting_service.get_meeting(db, meeting_id=id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    if meeting.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return meeting_service.delete_meeting(db, meeting_id=id)
