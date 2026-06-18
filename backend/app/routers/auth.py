from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from passlib.hash import bcrypt
from app.database import get_db
from app.models.user import User, UserRole
from app.models.client import Client
from app.schemas.user import SignupRequest, LoginRequest, LoginResponse, VerifyOTPRequest, ProfileUpdateRequest
from app.utils.jwt import create_access_token
from app.utils.otp import create_and_send_otp, verify_otp
from app.utils.auth import get_current_user

router = APIRouter()

@router.post("/signup")
async def signup(req: SignupRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(
        select(User).where((User.email == req.email) | (User.phone == req.phone))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email or phone already registered")

    password_hash = bcrypt.hash(req.password)
    user = User(
        name=req.name,
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
        name=user.name,
        company_name=company_name
    )

@router.post("/resend-otp")
async def resend_otp(email: str = None, phone: str = None, db: AsyncSession = Depends(get_db)):
    if not email and not phone:
        raise HTTPException(status_code=400, detail="Email or phone required")
    await create_and_send_otp(db, email=email, phone=phone)
    return {"message": "OTP resent"}

@router.get("/me")
async def get_me(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    """Return the current user's profile."""
    db_user = user # already a User model from Depends

    company_name = None
    if db_user.role == UserRole.CLIENT:
        client_result = await db.execute(select(Client).where(Client.user_id == db_user.id))
        client = client_result.scalar_one_or_none()
        company_name = client.company_name if client else None

    return {
        "user_id": str(db_user.id),
        "name": db_user.name,
        "email": db_user.email,
        "phone": db_user.phone,
        "role": db_user.role.value,
        "company_name": company_name,
        "is_verified": db_user.is_verified,
    }

@router.put("/me")
async def update_me(
    req: ProfileUpdateRequest,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    """Update current user's profile."""
    db_user = user

    if req.email and req.email != db_user.email:
        existing = await db.execute(select(User).where(User.email == req.email))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email already registered")
        db_user.email = req.email

    if req.phone and req.phone != db_user.phone:
        existing = await db.execute(select(User).where(User.phone == req.phone))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Phone number already registered")
        db_user.phone = req.phone

    if req.name:
        db_user.name = req.name

    if req.password:
        db_user.password_hash = bcrypt.hash(req.password)

    company_name = None
    if db_user.role == UserRole.CLIENT:
        client_result = await db.execute(select(Client).where(Client.user_id == db_user.id))
        client = client_result.scalar_one_or_none()
        if client:
            if req.company_name:
                client.company_name = req.company_name
            company_name = client.company_name

    await db.commit()

    return {
        "user_id": str(db_user.id),
        "name": db_user.name,
        "email": db_user.email,
        "phone": db_user.phone,
        "role": db_user.role.value,
        "company_name": company_name,
        "is_verified": db_user.is_verified,
    }

