from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

class SignupRequest(BaseModel):
    company_name: str
    contact_person: str
    email: str
    phone: str
    password: str
    company_details: Optional[str] = None

class SignupResponse(BaseModel):
    message: str
    email: str
    phone: str

class VerifyOTPRequest(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    code: str
    purpose: str = "signup"

class LoginRequest(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: UUID
    role: str
    company_name: Optional[str] = None

class UserResponse(BaseModel):
    id: UUID
    email: str
    phone: str
    role: str
    is_verified: bool
    created_at: datetime

class UserInDB(UserResponse):
    password_hash: str
