from datetime import datetime
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import schemas, models
from app.api import deps
from app.services import user_service

router = APIRouter()

@router.get("/", response_model=List[schemas.User])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve users.
    """
    users = user_service.get_users(db, skip=skip, limit=limit)
    return users

@router.post("/", response_model=schemas.User)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserCreate,
) -> Any:
    """
    Create new user.
    """
    user = user_service.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user = user_service.create_user(db, user=user_in)
    return user

@router.get("/me", response_model=schemas.User)
def read_user_me(
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.post("/heartbeat")
def update_status(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    status: str = "Online"
) -> Any:
    """
    Update current user status and last seen.
    """
    current_user.status = status
    current_user.last_seen = datetime.now().isoformat()
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return {"status": "ok"}

@router.put("/me", response_model=schemas.User)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserUpdate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update own user.
    """
    user = user_service.update_user(db, db_user=current_user, user_in=user_in)
    return user

@router.post("/verify-otp")
def verify_otp(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    otp: str
) -> Any:
    """
    Verify OTP for 2FA. In a real app, this would check against a stored or TOTP code.
    For this implementation, we simulate the verification.
    """
    if otp == "123456":
        current_user.two_factor_enabled = True
        db.add(current_user)
        db.commit()
        db.refresh(current_user)
        return {"status": "verified", "user": current_user}
    else:
        raise HTTPException(status_code=400, detail="Invalid OTP")
