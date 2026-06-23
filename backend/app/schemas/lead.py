from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class LeadCreate(BaseModel):
    name: str
    company: str
    phone: str
    email: Optional[str] = None
    requirement: Optional[str] = None

class LeadResponse(BaseModel):
    id: UUID
    name: str
    company: str
    phone: str
    email: Optional[str]
    requirement: Optional[str]
    status: str
    assigned_to: Optional[UUID]
    lead_score: int
    created_at: datetime

class LeadStatusUpdate(BaseModel):
    status: str
    assigned_to: Optional[UUID] = None

class FollowUpCreate(BaseModel):
    lead_id: UUID
    note: str
    next_followup_date: Optional[datetime] = None
    meeting_schedule: Optional[datetime] = None

class FollowUpResponse(BaseModel):
    id: UUID
    lead_id: UUID
    note: str
    next_followup_date: Optional[datetime]
    meeting_schedule: Optional[datetime]
    status: str
    created_at: datetime

class SalesActivityCreate(BaseModel):
    lead_id: Optional[UUID] = None
    discussion_notes: str
    next_action: Optional[str] = None

class SalesActivityResponse(BaseModel):
    id: UUID
    user_id: UUID
    lead_id: Optional[UUID]
    discussion_notes: str
    next_action: Optional[str]
    date: datetime
