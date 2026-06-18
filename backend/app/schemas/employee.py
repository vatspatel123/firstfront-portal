from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class EmployeeCreate(BaseModel):
    name: str
    role: str
    department: str
    email: str
    phone: str
    join_date: str
    salary: str
    avatar: str = ""


class EmployeeResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    role: str
    department: str
    email: str
    phone: str
    join_date: datetime
    salary: str
    status: str
    avatar: str

    class Config:
        from_attributes = True


class LeaveCreate(BaseModel):
    employee_id: UUID
    type: str
    from_date: str
    to_date: str
    days: int
    reason: str


class LeaveResponse(BaseModel):
    id: UUID
    employee_id: UUID
    type: str
    from_date: datetime
    to_date: datetime
    days: int
    reason: str
    status: str
    employee_name: str = ""

    class Config:
        from_attributes = True


class LeaveUpdate(BaseModel):
    status: str
    reviewed_by: Optional[UUID] = None


class ReviewCreate(BaseModel):
    employee_id: UUID
    period: str
    rating: float
    strengths: str = ""
    improvements: str = ""


class ReviewResponse(BaseModel):
    id: UUID
    employee_id: UUID
    period: str
    rating: float
    reviewer_id: UUID
    status: str
    strengths: str
    improvements: str
    employee_name: str = ""
    employee_avatar: str = ""

    class Config:
        from_attributes = True


class MessageCreate(BaseModel):
    project_id: UUID
    text: str


class MessageResponse(BaseModel):
    id: UUID
    project_id: UUID
    sender_id: UUID
    text: str
    read: bool
    created_at: datetime
    sender_name: str = ""
    sender_avatar: str = ""

    class Config:
        from_attributes = True


class InvoiceCreate(BaseModel):
    project_id: UUID
    client_id: UUID
    amount: str
    method: str = ""


class InvoiceResponse(BaseModel):
    id: UUID
    project_id: UUID
    client_id: UUID
    amount: str
    status: str
    method: str
    created_at: datetime
    project_name: str = ""

    class Config:
        from_attributes = True
