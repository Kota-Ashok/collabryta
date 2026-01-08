from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.message import ChatResponse, ChatCreate, MessageResponse, MessageCreate
from app.services import message_service

router = APIRouter()

@router.get("/conversations", response_model=List[Any])
def get_conversations(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
):
    """
    Get all conversations (chats) for the current user.
    """
    return message_service.get_user_chats(db, user_id=current_user.id)

@router.post("/conversations", response_model=ChatResponse)
def create_conversation(
    chat_in: ChatCreate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
):
    """
    Create a new conversation (P2P or Group).
    """
    return message_service.create_chat(db, chat_in=chat_in, creator_id=current_user.id)

@router.get("/{chat_id}", response_model=List[MessageResponse])
def get_messages(
    chat_id: int,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
):
    """
    Get messages for a specific chat.
    """
    msgs = message_service.get_chat_messages(db, chat_id=chat_id, user_id=current_user.id)
    return msgs

@router.post("/{chat_id}", response_model=MessageResponse)
async def send_message(
    chat_id: int,
    content: MessageCreate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
):
    """
    Send a message to a specific chat.
    """
    msg = await message_service.create_message(db, chat_id=chat_id, content=content.content, sender_id=current_user.id)
    if not msg:
        raise HTTPException(status_code=403, detail="Not a member of this chat")
    return msg

@router.put("/{chat_id}/read", status_code=200)
def mark_read(
    chat_id: int,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
):
    """
    Mark all messages in a chat as read.
    """
    success = message_service.mark_chat_as_read(db, chat_id=chat_id, user_id=current_user.id)
    if not success:
         raise HTTPException(status_code=403, detail="Not a member of this chat")
    return {"status": "success"}
