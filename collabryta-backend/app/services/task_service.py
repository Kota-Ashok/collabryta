from typing import List, Optional
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate
from app.services import notification_service
from app.schemas.notification import NotificationCreate

def get_tasks(db: Session, skip: int = 0, limit: int = 100, user_id: int = None) -> List[Task]:
    now = datetime.now(timezone.utc)
    # Hide tasks where due_date is in the past by more than 1 day
    past_limit = now - timedelta(days=1)
    
    query = db.query(Task)
    
    # Filter out tasks that are "expired" (past due date by more than 1 day)
    # We only apply this to tasks that have a due_date
    query = query.filter(
        (Task.due_date == None) | (Task.due_date >= past_limit)
    )
    
    if user_id:
        query = query.filter((Task.owner_id == user_id) | (Task.assignee_id == user_id))
        
    return query.offset(skip).limit(limit).all()

async def create_task(db: Session, task: TaskCreate, owner_id: int) -> Task:
    db_task = Task(**task.model_dump(), owner_id=owner_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    # Notify Owner
    await notification_service.create_notification(db, NotificationCreate(
        user_id=owner_id,
        title="Task Created",
        description=f"Task '{db_task.title}' created successfully.",
        type="success"
    ))
    
    # Notify Assignee if different
    if db_task.assignee_id and db_task.assignee_id != owner_id:
        await notification_service.create_notification(db, NotificationCreate(
            user_id=db_task.assignee_id,
            title="New Task Assigned",
            description=f"You have been assigned to task '{db_task.title}'.",
            type="info"
        ))
        
    return db_task

def get_task(db: Session, task_id: int) -> Optional[Task]:
    return db.query(Task).filter(Task.id == task_id).first()

async def update_task(db: Session, task_id: int, task_update: TaskUpdate) -> Optional[Task]:
    db_task = get_task(db, task_id)
    if not db_task:
        return None
    
    update_data = task_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)
    
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    # Notify Owner
    await notification_service.create_notification(db, NotificationCreate(
        user_id=db_task.owner_id,
        title="Task Updated",
        description=f"Task '{db_task.title}' has been updated.",
        type="info"
    ))
    
    # Notify Assignee if different
    if db_task.assignee_id and db_task.assignee_id != db_task.owner_id:
        await notification_service.create_notification(db, NotificationCreate(
            user_id=db_task.assignee_id,
            title="Task Updated",
            description=f"Task '{db_task.title}' assigned to you has been updated.",
            type="info"
        ))
        
    return db_task

def delete_task(db: Session, task_id: int) -> Optional[Task]:
    db_task = get_task(db, task_id)
    if db_task:
        db.delete(db_task)
        db.commit()
    return db_task
