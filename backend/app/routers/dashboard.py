from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.project import Project, ProjectStatus
from app.models.lead import Lead, LeadStatus
from app.models.user import User, UserRole
from app.models.lead import FollowUp
from app.utils.auth import get_current_user, require_role

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

    return {
        "total_leads": total_leads.scalar(),
        "total_projects": total_projects.scalar(),
        "active_projects": active_projects.scalar(),
        "pending_followups": pending_followups.scalar(),
        "team_size": team_count.scalar()
    }
