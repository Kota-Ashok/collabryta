from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.message import Message, MessageCreate
from app.services import message_service

router = APIRouter()

@router.get("/conversations/", response_model=List[Any])
def read_conversations(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
):
    """
    Retrieve active conversations for the current user.
    """
    conversations = message_service.get_conversations(db, user_id=current_user.id)
    return conversations

@router.get("/{contact_id}", response_model=List[Message])
def read_messages(
    contact_id: int,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
):
    """
    Retrieve messages between current user and contact_id.
    """
    messages = message_service.get_messages(db, user_id=current_user.id, contact_id=contact_id)
    return messages

@router.post("/", response_model=Message)
def create_message(
    message_in: MessageCreate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
):
    """
    Send a new message to a user.
    """
    return message_service.create_message(db, message=message_in, sender_id=current_user.id)
