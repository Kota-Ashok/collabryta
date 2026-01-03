from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from app.models.message import Message
from app.models.user import User
from app.schemas.message import MessageCreate

def get_messages(db: Session, user_id: int, contact_id: int):
    return db.query(Message).filter(
        or_(
            and_(Message.sender_id == user_id, Message.receiver_id == contact_id),
            and_(Message.sender_id == contact_id, Message.receiver_id == user_id)
        )
    ).order_by(Message.timestamp).all()

def create_message(db: Session, message: MessageCreate, sender_id: int):
    db_message = Message(
        sender_id=sender_id,
        receiver_id=message.receiver_id,
        content=message.content,
        is_read=False
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def get_conversations(db: Session, user_id: int):
    # Get all messages involving the user, ordered by latest first
    all_messages = db.query(Message).filter(
        or_(Message.sender_id == user_id, Message.receiver_id == user_id)
    ).order_by(Message.timestamp.desc()).all()
    
    # Filter to get only the latest message per contact
    conversations = {}
    for msg in all_messages:
        other_id = msg.receiver_id if msg.sender_id == user_id else msg.sender_id
        if other_id not in conversations:
             conversations[other_id] = msg
    
    if not conversations:
        return []

    # Fetch user details for these contacts
    users = db.query(User).filter(User.id.in_(conversations.keys())).all()
    
    result = []
    for u in users:
        last_msg = conversations[u.id]
        
        # Calculate unread count (messages sent BY contact TO me, and not read)
        unread = db.query(Message).filter(
            Message.sender_id == u.id,
            Message.receiver_id == user_id,
            Message.is_read == False
        ).count()

        result.append({
            "id": u.id,
            "name": u.name,
            "unread_count": unread,
            "status": "online" if u.is_active else "offline",
            "is_active": True, # You might want to filter this
            "last_message": last_msg.content,
            "last_message_time": last_msg.timestamp
        })
    return result
