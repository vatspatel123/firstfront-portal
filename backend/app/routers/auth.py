from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from passlib.hash import bcrypt
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.user import User, UserRole
from app.models.client import Client
from app.schemas.user import SignupRequest, LoginRequest, LoginResponse, VerifyOTPRequest
from app.utils.jwt import create_access_token
from app.utils.otp import create_and_send_otp, verify_otp
from app.utils.auth import get_current_user, require_role

router = APIRouter()

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

class CreateUserRequest(BaseModel):
    name: str
    email: str
    phone: str
    password: str
    role: str  # client, sales, designer, admin
    company_name: Optional[str] = None

@router.post("/signup")
async def signup(req: SignupRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(
        select(User).where((User.email == req.email) | (User.phone == req.phone))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email or phone already registered")

    password_hash = bcrypt.hash(req.password)
    user = User(
        email=req.email,
        phone=req.phone,
        password_hash=password_hash,
        role=UserRole.CLIENT,
        is_verified=False
    )
    db.add(user)
    await db.flush()

    client = Client(
        user_id=user.id,
        company_name=req.company_name,
        contact_person=req.contact_person,
        company_details=req.company_details
    )
    db.add(client)
    await db.commit()

    await create_and_send_otp(db, email=req.email, phone=req.phone, purpose="signup")

    return {"message": "Account created. Please verify OTP sent to your email/phone.", "email": req.email, "phone": req.phone}

@router.post("/verify-otp")
async def verify_otp_endpoint(req: VerifyOTPRequest, db: AsyncSession = Depends(get_db)):
    valid = await verify_otp(db, code=req.code, email=req.email, phone=req.phone, purpose=req.purpose)
    if not valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    query = select(User)
    if req.email:
        query = query.where(User.email == req.email)
    elif req.phone:
        query = query.where(User.phone == req.phone)

    result = await db.execute(query)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_verified = True
    await db.commit()

    return {"message": "Account verified successfully"}

@router.post("/login")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    query = select(User)
    if req.email:
        query = query.where(User.email == req.email)
    elif req.phone:
        query = query.where(User.phone == req.phone)

    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if not user or not bcrypt.verify(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_verified:
        raise HTTPException(status_code=401, detail="Please verify your account first")

    if not user.is_active:
        raise HTTPException(status_code=401, detail="Account is deactivated")

    token = create_access_token(user.id, user.role.value)

    company_name = None
    if user.role == UserRole.CLIENT:
        client_result = await db.execute(select(Client).where(Client.user_id == user.id))
        client = client_result.scalar_one_or_none()
        company_name = client.company_name if client else None

    return LoginResponse(
        access_token=token,
        user_id=user.id,
        role=user.role.value,
        company_name=company_name
    )

@router.post("/resend-otp")
async def resend_otp(email: str = None, phone: str = None, db: AsyncSession = Depends(get_db)):
    if not email and not phone:
        raise HTTPException(status_code=400, detail="Email or phone required")
    await create_and_send_otp(db, email=email, phone=phone)
    return {"message": "OTP resent"}

@router.get("/me")
async def get_profile(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    company_name = None
    if user.role == UserRole.CLIENT:
        client_result = await db.execute(select(Client).where(Client.user_id == user.id))
        client = client_result.scalar_one_or_none()
        company_name = client.company_name if client else None

    return {
        "id": str(user.id),
        "email": user.email,
        "phone": user.phone,
        "role": user.role.value,
        "is_verified": user.is_verified,
        "company_name": company_name,
        "created_at": user.created_at.isoformat()
    }

@router.put("/me")
async def update_profile(
    req: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if req.email:
        existing = await db.execute(
            select(User).where(User.email == req.email, User.id != user.id)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = req.email

    if req.phone:
        existing = await db.execute(
            select(User).where(User.phone == req.phone, User.id != user.id)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Phone already in use")
        user.phone = req.phone

    if user.role == UserRole.CLIENT and req.company_name:
        client_result = await db.execute(select(Client).where(Client.user_id == user.id))
        client = client_result.scalar_one_or_none()
        if client:
            client.company_name = req.company_name

    await db.commit()
    return {"message": "Profile updated"}

@router.put("/me/password")
async def update_password(
    req: PasswordUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not bcrypt.verify(req.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    user.password_hash = bcrypt.hash(req.new_password)
    await db.commit()
    return {"message": "Password updated"}


@router.post("/create-user")
async def admin_create_user(
    req: CreateUserRequest,
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role(UserRole.ADMIN))
):
    """Admin-only: Create a new user with any role (sales, designer, admin, client)"""
    existing = await db.execute(
        select(User).where((User.email == req.email) | (User.phone == req.phone))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email or phone already registered")

    valid_roles = [r.value for r in UserRole]
    if req.role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {valid_roles}")

    password_hash = bcrypt.hash(req.password)
    new_user = User(
        email=req.email,
        phone=req.phone,
        password_hash=password_hash,
        role=UserRole(req.role),
        name=req.name,
        is_verified=True  # Admin-created users are auto-verified
    )
    db.add(new_user)
    await db.flush()

    # If creating a client, also create client profile
    if req.role == UserRole.CLIENT.value:
        client = Client(
            user_id=new_user.id,
            company_name=req.company_name or req.name,
            contact_person=req.name,
        )
        db.add(client)

    await db.commit()
    await db.refresh(new_user)

    return {
        "message": f"User created successfully",
        "user_id": str(new_user.id),
        "email": new_user.email,
        "role": new_user.role.value,
        "name": new_user.name
    }


@router.get("/users")
async def list_users(
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role(UserRole.ADMIN))
):
    """Admin-only: List all users"""
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    return [
        {
            "id": str(u.id),
            "name": u.name,
            "email": u.email,
            "phone": u.phone,
            "role": u.role.value,
            "is_verified": u.is_verified,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat()
        }
        for u in users
    ]
