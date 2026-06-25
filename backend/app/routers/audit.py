from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from pydantic import BaseModel
from app.database import get_db
from app.models.note import AuditLog
from app.utils.auth import get_current_user, require_role
from app.models.user import UserRole

router = APIRouter()


class AuditLogResponse(BaseModel):
    id: str
    user_name: str
    user_role: str
    action: str
    entity_type: str
    entity_id: str | None
    entity_name: str | None
    details: str | None
    created_at: str


@router.get("/", response_model=List[AuditLogResponse])
async def list_audit_logs(
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role(UserRole.ADMIN))
):
    result = await db.execute(
        select(AuditLog).order_by(AuditLog.created_at.desc()).limit(200)
    )
    logs = result.scalars().all()
    return [
        AuditLogResponse(
            id=str(log.id),
            user_name=log.user_name,
            user_role=log.user_role,
            action=log.action,
            entity_type=log.entity_type,
            entity_id=log.entity_id,
            entity_name=log.entity_name,
            details=log.details,
            created_at=log.created_at.isoformat()
        )
        for log in logs
    ]


async def create_audit_log(
    db: AsyncSession,
    user_id, user_name: str, user_role: str,
    action: str, entity_type: str,
    entity_id: str = None, entity_name: str = None, details: str = None
):
    log = AuditLog(
        user_id=user_id,
        user_name=user_name,
        user_role=user_role,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        entity_name=entity_name,
        details=details,
    )
    db.add(log)
