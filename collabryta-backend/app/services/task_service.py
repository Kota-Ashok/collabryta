from typing import List, Optional
from sqlalchemy.orm import Session
from app import models, schemas
from datetime import datetime

def get_user_tasks(db: Session, user_id: int) -> List[models.Task]:
    return db.query(models.Task).filter(
        (models.Task.owner_id == user_id) | (models.Task.assigned_to_id == user_id)
    ).all()

def create_task(db: Session, task_in: schemas.TaskCreate, owner_id: int) -> models.Task:
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
    return db_obj

def update_task(db: Session, task_id: int, task_in: schemas.TaskUpdate) -> Optional[models.Task]:
    task = get_task(db, task_id)
    if not task:
        return None
    
    update_data = task_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
        
    db.add(task)
    db.commit()
    db.refresh(task)
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
