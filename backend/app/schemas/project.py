from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class ProjectCreate(BaseModel):
    name: str
    location: str
    capacity: str
    project_type: str
    services_required: str
    notes: Optional[str] = None

class ProjectResponse(BaseModel):
    id: UUID
    client_id: UUID
    name: str
    location: str
    capacity: str
    project_type: str
    services_required: str
    notes: Optional[str]
    status: str
    assigned_to: Optional[UUID]
    client_name: Optional[str] = None
    designer_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    capacity: Optional[str] = None
    project_type: Optional[str] = None
    services_required: Optional[str] = None
    notes: Optional[str] = None

class ProjectStatusUpdate(BaseModel):
    status: str
    note: Optional[str] = None
    assigned_to: Optional[UUID] = None

class ProjectFileResponse(BaseModel):
    id: UUID
    project_id: UUID
    file_type: str
    file_url: str
    original_name: str
    created_at: datetime

    class Config:
        from_attributes = True

class ProjectOutputCreate(BaseModel):
    notes: Optional[str] = None

class ProjectOutputResponse(BaseModel):
    id: UUID
    project_id: UUID
    file_url: str
    original_name: str
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
