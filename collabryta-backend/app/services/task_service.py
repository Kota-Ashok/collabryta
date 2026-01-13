from typing import List, Optional
from sqlalchemy.orm import Session
from app import models, schemas
from datetime import datetime

def get_user_tasks(db: Session, user_id: int) -> List[models.Task]:
    return db.query(models.Task).filter(
        (models.Task.owner_id == user_id) | (models.Task.assigned_to_id == user_id)
    ).all()

async def create_task(db: Session, task_in: schemas.TaskCreate, owner_id: int) -> models.Task:
    task_data = task_in.model_dump()
    db_obj = models.Task(
        **task_data,
        owner_id=owner_id
    )
    if not db_obj.assigned_to_id:
        db_obj.assigned_to_id = owner_id
        
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    # Notify Assignee
    from app.services import notification_service
    from app.schemas.notification import NotificationCreate
    
    if db_obj.assigned_to_id:
        await notification_service.create_notification(db, NotificationCreate(
            user_id=db_obj.assigned_to_id,
            title="New Task Assigned",
            description=f"Task '{db_obj.title}' has been assigned to you.",
            type="info"
        ))
    
    return db_obj

async def update_task(db: Session, task_id: int, task_in: schemas.TaskUpdate) -> Optional[models.Task]:
    task = get_task(db, task_id)
    if not task:
        return None
    
    old_status = task.status
    update_data = task_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
        
    db.add(task)
    db.commit()
    db.refresh(task)
    
    # Notify Owner/Assignee on status change
    from app.services import notification_service
    from app.schemas.notification import NotificationCreate
    
    if "status" in update_data and old_status != task.status:
        # Notify Owner if someone else changed it
        await notification_service.create_notification(db, NotificationCreate(
            user_id=task.owner_id,
            title="Task Status Updated",
            description=f"Task '{task.title}' status changed to {task.status}.",
            type="info"
        ))
        
        # Notify Assignee if different from owner
        if task.assigned_to_id != task.owner_id:
            await notification_service.create_notification(db, NotificationCreate(
                user_id=task.assigned_to_id,
                title="Task Status Updated",
                description=f"Task '{task.title}' status changed to {task.status}.",
                type="info"
            ))
            
    return task

def delete_task(db: Session, task_id: int) -> Optional[models.Task]:
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        return None
    db.delete(task)
    db.commit()
    return task

def get_task(db: Session, task_id: int) -> Optional[models.Task]:
     return db.query(models.Task).filter(models.Task.id == task_id).first()
