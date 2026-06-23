import random
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.config import get_settings
from app.models.otp import OTPCode

settings = get_settings()

def generate_otp() -> str:
    return str(random.randint(100000, 999999))

async def send_otp_email(email: str, code: str):
    if settings.resend_api_key:
        import resend
        resend.api_key = settings.resend_api_key
        resend.Emails.send({
            "from": settings.from_email,
            "to": email,
            "subject": "Your OTP for First Front Portal",
            "html": f"<p>Your OTP is: <strong>{code}</strong></p><p>Valid for {settings.otp_expire_minutes} minutes.</p>"
        })

async def send_otp_sms(phone: str, code: str):
    if settings.twilio_account_sid:
        from twilio.rest import Client
        client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
        client.messages.create(
            body=f"Your OTP for First Front Portal: {code}",
            from_=settings.twilio_phone_number,
            to=phone
        )

async def create_and_send_otp(db: AsyncSession, email: str = None, phone: str = None, purpose: str = "signup"):
    code = generate_otp()
    otp = OTPCode(
        email=email,
        phone=phone,
        code=code,
        purpose=purpose,
        expires_at=datetime.utcnow() + timedelta(minutes=settings.otp_expire_minutes)
    )
    db.add(otp)
    await db.commit()

    if email:
        await send_otp_email(email, code)
    if phone:
        await send_otp_sms(phone, code)
    return True

async def verify_otp(db: AsyncSession, code: str, email: str = None, phone: str = None, purpose: str = "signup") -> bool:
    query = select(OTPCode).where(
        OTPCode.code == code,
        OTPCode.purpose == purpose,
        OTPCode.is_used == False,
        OTPCode.expires_at > datetime.utcnow()
    )
    if email:
        query = query.where(OTPCode.email == email)
    if phone:
        query = query.where(OTPCode.phone == phone)

    result = await db.execute(query)
    otp = result.scalar_one_or_none()
    if not otp:
        return False

    otp.is_used = True
    await db.commit()
    return True
