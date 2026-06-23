from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.utils.auth import get_current_user

router = APIRouter()

@router.get("/health")
async def ai_health(user=Depends(get_current_user)):
    return {"status": "ok", "provider": "not configured"}
