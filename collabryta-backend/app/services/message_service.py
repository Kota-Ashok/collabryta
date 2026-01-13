from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from app.models.message import Message, Chat, ChatParticipant
from app.models.user import User
from app.schemas.message import ChatCreate
from typing import List, Optional
from datetime import datetime

def get_user_chats(db: Session, user_id: int) -> List[dict]:
    """Retrieves all conversations for a specific user with last message and unread count."""
    user_chats = db.query(Chat).join(ChatParticipant).filter(ChatParticipant.user_id == user_id).all()
    
    results = []
    for chat in user_chats:
        last_msg = db.query(Message).filter(Message.chat_id == chat.id).order_by(Message.timestamp.desc()).first()
        
        info = {
            "id": chat.id,
            "is_group": chat.is_group,
            "last_message": last_msg.content if last_msg else None,
            "last_message_time": last_msg.timestamp if last_msg else None,
            "unread_count": db.query(Message).filter(
                Message.chat_id == chat.id, 
                Message.sender_id != user_id, 
                Message.is_read == False
            ).count()
        }

        if chat.is_group:
            info["name"] = chat.name or "Group Chat"
            info["status"] = "group"
            info["other_user_id"] = None
        else:
            other_part = db.query(ChatParticipant).filter(
                ChatParticipant.chat_id == chat.id, 
                ChatParticipant.user_id != user_id
            ).first()
            
            if other_part:
                other_user = db.query(User).filter(User.id == other_part.user_id).first()
                if other_user:
                    info["name"] = other_user.name
                    info["status"] = "online" if other_user.is_active else "offline"
                    info["other_user_id"] = other_user.id
                else:
                    info.update({"name": "Unknown", "status": "offline", "other_user_id": None})
            else:
                 info.update({"name": "Me", "status": "online", "other_user_id": user_id})

        results.append(info)
    
    results.sort(key=lambda x: x['last_message_time'] or datetime.min, reverse=True)
    return results

def get_chat_messages(db: Session, chat_id: int, user_id: int) -> List[Message]:
    """Retrieves all messages for a specific chat if the user is a participant."""
    is_member = db.query(ChatParticipant).filter(
        ChatParticipant.chat_id == chat_id, ChatParticipant.user_id == user_id
    ).first()
    
    if not is_member:
        return [] 
        
    return db.query(Message).options(joinedload(Message.sender)).filter(Message.chat_id == chat_id).order_by(Message.timestamp).all()

def create_chat(db: Session, chat_in: ChatCreate, creator_id: int) -> Chat:
    """Creates a new group or P2P chat."""
    if not chat_in.is_group and len(chat_in.participant_ids) == 1:
        other_id = chat_in.participant_ids[0]
        c_chats_sub = db.query(ChatParticipant.chat_id).join(Chat).filter(
            ChatParticipant.user_id == creator_id, 
            Chat.is_group == False
        ).subquery()
        
        existing = db.query(ChatParticipant).filter(
            ChatParticipant.user_id == other_id,
            ChatParticipant.chat_id.in_(c_chats_sub)
        ).first()
        
        if existing:
            return db.query(Chat).filter(Chat.id == existing.chat_id).first()

    db_chat = Chat(name=chat_in.name, is_group=chat_in.is_group)
    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)
    
    p_ids = set(chat_in.participant_ids)
    p_ids.add(creator_id)
    
    for pid in p_ids:
        part = ChatParticipant(chat_id=db_chat.id, user_id=pid)
        db.add(part)
    
    db.commit()
    db.refresh(db_chat)
    return db_chat



async def create_message(db: Session, chat_id: int, content: str, sender_id: int) -> Optional[Message]:
    """Sends a new message to a chat."""
    is_member = db.query(ChatParticipant).filter(
        ChatParticipant.chat_id == chat_id, ChatParticipant.user_id == sender_id
    ).first()
    
    if not is_member:
         return None

    msg = Message(chat_id=chat_id, sender_id=sender_id, content=content)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    
    # Notify Participants
    from app.services import notification_service
    from app.schemas.notification import NotificationCreate
    
    sender = db.query(User).filter(User.id == sender_id).first()
    sender_name = sender.name if sender else "Someone"
    
    participants = db.query(ChatParticipant).filter(ChatParticipant.chat_id == chat_id).all()
    for part in participants:
        if part.user_id != sender_id:
            await notification_service.create_notification(db, NotificationCreate(
                user_id=part.user_id,
                title=f"New Message from {sender_name}",
                description=content[:50] + ("..." if len(content) > 50 else ""),
                type="info"
            ))
    
    return msg

def mark_chat_as_read(db: Session, chat_id: int, user_id: int) -> bool:
    """Marks all unread messages in a chat as read for the user."""
    is_member = db.query(ChatParticipant).filter(
        ChatParticipant.chat_id == chat_id, ChatParticipant.user_id == user_id
    ).first()
    
    if not is_member:
         return False

    db.query(Message).filter(
        Message.chat_id == chat_id,
        Message.sender_id != user_id,
        Message.is_read == False
    ).update({Message.is_read: True})
    
    db.commit()
    return True
