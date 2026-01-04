from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas, models
from app.api import deps
from app.services import task_service

router = APIRouter()

@router.get("/", response_model=List[schemas.Task])
def read_tasks(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve tasks.
    """
    # If we strictly want personalized:
    tasks = task_service.get_tasks(db, skip=skip, limit=limit, user_id=current_user.id)
    return tasks

@router.get("/{id}", response_model=schemas.Task)
def read_task(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get task by ID.
    """
    task = task_service.get_task(db=db, task_id=id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.post("/", response_model=schemas.Task)
def create_task(
    *,
    db: Session = Depends(deps.get_db),
    task_in: schemas.TaskCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new task.
    """
    task = task_service.create_task(db=db, task=task_in, owner_id=current_user.id)
    return task

@router.put("/{id}", response_model=schemas.Task)
def update_task(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    task_in: schemas.TaskUpdate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update a task.
    """
    task = task_service.get_task(db=db, task_id=id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    # Add permissions check here if needed
    task = task_service.update_task(db=db, task_id=id, task_update=task_in)
    return task

@router.delete("/{id}", response_model=schemas.Task)
def delete_task(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete a task.
    """
    task = task_service.get_task(db=db, task_id=id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    # Add permissions check here
    task = task_service.delete_task(db=db, task_id=id)
    return task
