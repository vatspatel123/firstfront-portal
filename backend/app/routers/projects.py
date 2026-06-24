from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List, Optional
from app.database import get_db
from app.models.project import Project, ProjectStatus, ProjectFile, ProjectOutput, ProjectStatusLog
from app.models.client import Client
from app.models.user import User
from app.schemas.project import (ProjectCreate, ProjectResponse, ProjectStatusUpdate,
                                 ProjectFileResponse, ProjectOutputResponse)
from app.utils.auth import get_current_user, get_current_client
from app.services.file_storage import save_upload, get_file_path
from app.models.note import Notification
from fastapi.responses import FileResponse

router = APIRouter()

@router.post("/", response_model=ProjectResponse)
async def create_project(
    req: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    # Find or create client profile for this user
    client = await db.execute(select(Client).where(Client.user_id == user.id))
    client = client.scalar_one_or_none()
    if not client:
        # Auto-create client profile for non-client users (admin/sales creating on behalf)
        from app.models.user import UserRole
        if user.role in [UserRole.ADMIN, UserRole.SALES, UserRole.DESIGNER]:
            client = Client(
                user_id=user.id,
                company_name=user.name or user.email,
                contact_person=user.name or user.email,
            )
            db.add(client)
            await db.flush()
        else:
            raise HTTPException(status_code=404, detail="Client profile not found")

    project = Project(
        client_id=client.id,
        name=req.name,
        location=req.location,
        capacity=req.capacity,
        project_type=req.project_type,
        services_required=req.services_required,
        notes=req.notes,
        status=ProjectStatus.NEW,
        priority=req.priority or "medium",
        deadline=req.deadline
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)

    log = ProjectStatusLog(
        project_id=project.id,
        to_status=ProjectStatus.NEW.value,
        changed_by=user.id,
        note="Project created by client"
    )
    db.add(log)
    await db.commit()

    return await _enrich_project(project, db)


async def _enrich_project(project, db):
    client_result = await db.execute(select(Client).where(Client.id == project.client_id))
    client = client_result.scalar_one_or_none()
    designer_name = None
    if project.assigned_to:
        designer_result = await db.execute(select(User).where(User.id == project.assigned_to))
        designer = designer_result.scalar_one_or_none()
        if designer:
            designer_name = designer.name
    return ProjectResponse(
        id=project.id,
        client_id=project.client_id,
        name=project.name,
        location=project.location,
        capacity=project.capacity,
        project_type=project.project_type,
        services_required=project.services_required,
        notes=project.notes,
        status=project.status.value,
        assigned_to=project.assigned_to,
        priority=project.priority,
        deadline=project.deadline,
        created_at=project.created_at,
        updated_at=project.updated_at,
        client_name=client.company_name if client else None,
        designer_name=designer_name
    )


@router.get("/", response_model=List[ProjectResponse])
async def list_projects(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    search: Optional[str] = Query(None),
    assigned_to_me: Optional[bool] = Query(None),
    status: Optional[str] = Query(None)
):
    query = select(Project)

    if user.role.value == "client":
        client = await db.execute(select(Client).where(Client.user_id == user.id))
        client = client.scalar_one_or_none()
        if not client:
            return []
        query = query.where(Project.client_id == client.id)

    if assigned_to_me and user.role.value == "designer":
        query = query.where(Project.assigned_to == user.id)

    if status:
        query = query.where(Project.status == ProjectStatus(status))

    if search:
        query = query.where(Project.name.ilike(f"%{search}%"))

    query = query.order_by(Project.created_at.desc())
    result = await db.execute(query)
    projects = result.scalars().all()

    enriched = []
    for p in projects:
        enriched.append(await _enrich_project(p, db))
    return enriched


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: UUID, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return await _enrich_project(project, db)


@router.patch("/{project_id}/status")
async def update_project_status(
    project_id: UUID,
    req: ProjectStatusUpdate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    old_status = project.status.value
    project.status = ProjectStatus(req.status)
    if req.assigned_to:
        project.assigned_to = req.assigned_to
    if req.deadline:
        project.deadline = req.deadline
    if req.priority:
        project.priority = req.priority

    log = ProjectStatusLog(
        project_id=project.id,
        from_status=old_status,
        to_status=req.status,
        changed_by=user.id,
        note=req.note
    )
    db.add(log)

    # Create notification for the assigned designer or client
    status_label = req.status.replace('_', ' ').title()
    notif_user_id = req.assigned_to if req.assigned_to else project.client_id
    # For clients, we need the user_id from client profile
    if not req.assigned_to:
        client_result = await db.execute(select(Client).where(Client.id == project.client_id))
        client = client_result.scalar_one_or_none()
        if client:
            notif_user_id = client.user_id
    if notif_user_id and str(notif_user_id) != str(user.id):
        notification = Notification(
            user_id=notif_user_id,
            type="status_change",
            message=f"Project '{project.name}' status updated to {status_label}" + (f" — {req.note}" if req.note else ""),
            related_id=project.id
        )
        db.add(notification)

    await db.commit()

    return {"message": "Status updated"}


@router.post("/{project_id}/files", response_model=ProjectFileResponse)
async def upload_file(
    project_id: UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    file_url = await save_upload(str(project_id), file)
    project_file = ProjectFile(
        project_id=project_id,
        uploaded_by=user.id,
        file_type=file.content_type or "application/octet-stream",
        file_url=file_url,
        original_name=file.filename
    )
    db.add(project_file)
    await db.commit()
    await db.refresh(project_file)
    return project_file


@router.get("/{project_id}/files", response_model=List[ProjectFileResponse])
async def list_project_files(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    result = await db.execute(
        select(ProjectFile).where(ProjectFile.project_id == project_id).order_by(ProjectFile.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{project_id}/outputs", response_model=List[ProjectOutputResponse])
async def list_project_outputs(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    result = await db.execute(
        select(ProjectOutput).where(ProjectOutput.project_id == project_id).order_by(ProjectOutput.created_at.desc())
    )
    return result.scalars().all()


@router.get("/download/{file_id}")
async def download_file(file_id: UUID, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(select(ProjectFile).where(ProjectFile.id == file_id))
    project_file = result.scalar_one_or_none()
    if not project_file:
        raise HTTPException(status_code=404, detail="File not found")
    file_path = get_file_path(project_file.file_url)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    return FileResponse(path=str(file_path), filename=project_file.original_name, media_type=project_file.file_type)


@router.get("/download-output/{output_id}")
async def download_output(output_id: UUID, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(select(ProjectOutput).where(ProjectOutput.id == output_id))
    output = result.scalar_one_or_none()
    if not output:
        raise HTTPException(status_code=404, detail="Output not found")
    file_path = get_file_path(output.file_url)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    return FileResponse(path=str(file_path), filename=output.original_name, media_type="application/octet-stream")
