from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.project import Project, ProjectStatus
from app.models.lead import Lead, LeadStatus, FollowUp
from app.models.user import User, UserRole
from app.models.client import Client
from app.models.note import Notification
from app.utils.auth import get_current_user, require_role, get_current_client

router = APIRouter()

@router.get("/admin")
async def admin_dashboard(db: AsyncSession = Depends(get_db), user=Depends(require_role(UserRole.ADMIN))):
    total_leads = await db.execute(select(func.count(Lead.id)))
    total_projects = await db.execute(select(func.count(Project.id)))
    active_projects = await db.execute(
        select(func.count(Project.id)).where(Project.status.in_([
            ProjectStatus.ASSIGNED, ProjectStatus.DESIGN_IN_PROGRESS
        ]))
    )
    pending_followups = await db.execute(
        select(func.count(FollowUp.id)).where(FollowUp.status == "pending")
    )
    team_count = await db.execute(
        select(func.count(User.id)).where(User.role.in_([UserRole.SALES, UserRole.DESIGNER]))
    )

    leads_by_status = await db.execute(
        select(Lead.status, func.count(Lead.id)).group_by(Lead.status)
    )
    projects_by_status = await db.execute(
        select(Project.status, func.count(Project.id)).group_by(Project.status)
    )

    return {
        "total_leads": total_leads.scalar(),
        "total_projects": total_projects.scalar(),
        "active_projects": active_projects.scalar(),
        "pending_followups": pending_followups.scalar(),
        "team_size": team_count.scalar(),
        "leads_by_status": {row[0].value if hasattr(row[0], 'value') else row[0]: row[1] for row in leads_by_status},
        "projects_by_status": {row[0].value if hasattr(row[0], 'value') else row[0]: row[1] for row in projects_by_status}
    }

@router.get("/client")
async def client_dashboard(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    client = await db.execute(select(Client).where(Client.user_id == user.id))
    client = client.scalar_one_or_none()
    if not client:
        return {"total_projects": 0, "in_progress": 0, "delivered": 0, "recent_projects": [], "recent_activity": []}

    total = await db.execute(
        select(func.count(Project.id)).where(Project.client_id == client.id)
    )
    in_progress = await db.execute(
        select(func.count(Project.id)).where(
            Project.client_id == client.id,
            Project.status.in_([
                ProjectStatus.ASSIGNED, ProjectStatus.DESIGN_IN_PROGRESS,
                ProjectStatus.DATA_REVIEW, ProjectStatus.DATA_COMPLETE
            ])
        )
    )
    delivered = await db.execute(
        select(func.count(Project.id)).where(
            Project.client_id == client.id,
            Project.status == ProjectStatus.DELIVERED
        )
    )

    recent = await db.execute(
        select(Project)
        .where(Project.client_id == client.id)
        .order_by(Project.updated_at.desc())
        .limit(5)
    )
    recent_projects = [
        {"id": str(p.id), "name": p.name, "status": p.status.value, "updated_at": p.updated_at.isoformat()}
        for p in recent.scalars().all()
    ]

    notifications_count = await db.execute(
        select(func.count(Notification.id)).where(
            Notification.user_id == user.id,
            Notification.is_read == False
        )
    )

    return {
        "total_projects": total.scalar(),
        "in_progress": in_progress.scalar(),
        "delivered": delivered.scalar(),
        "recent_projects": recent_projects,
        "unread_notifications": notifications_count.scalar()
    }
