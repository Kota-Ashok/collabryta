from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, 
    users, 
    messages, 
    files, 
    meetings, 
    notifications,
    tasks
)

api_router = APIRouter()

# Include all module routers
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(messages.router, prefix="/messages", tags=["messages"])
api_router.include_router(files.router, prefix="/files", tags=["files"])
api_router.include_router(meetings.router, prefix="/meetings", tags=["meetings"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
