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
    created_at: datetime
    updated_at: datetime

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

class ProjectOutputCreate(BaseModel):
    notes: Optional[str] = None

class ProjectOutputResponse(BaseModel):
    id: UUID
    project_id: UUID
    file_url: str
    original_name: str
    notes: Optional[str]
    created_at: datetime
