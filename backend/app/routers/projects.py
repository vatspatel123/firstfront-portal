from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List
from app.database import get_db
from app.models.project import Project, ProjectStatus, ProjectFile, ProjectOutput, ProjectStatusLog
from app.models.client import Client
from app.schemas.project import (ProjectCreate, ProjectResponse, ProjectStatusUpdate,
                                 ProjectFileResponse, ProjectOutputResponse)
from app.utils.auth import get_current_user, get_current_client

router = APIRouter()

@router.post("/", response_model=ProjectResponse)
async def create_project(
    req: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_client)
):
    client = await db.execute(select(Client).where(Client.user_id == user.id))
    client = client.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client profile not found")

    project = Project(
        client_id=client.id,
        name=req.name,
        location=req.location,
        capacity=req.capacity,
        project_type=req.project_type,
        services_required=req.services_required,
        notes=req.notes,
        status=ProjectStatus.NEW
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

    return project

@router.get("/", response_model=List[ProjectResponse])
async def list_projects(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    if user.role.value == "client":
        client = await db.execute(select(Client).where(Client.user_id == user.id))
        client = client.scalar_one_or_none()
        if not client:
            return []
        result = await db.execute(
            select(Project).where(Project.client_id == client.id).order_by(Project.created_at.desc())
        )
    else:
        result = await db.execute(select(Project).order_by(Project.created_at.desc()))
    return result.scalars().all()

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: UUID, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

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

    log = ProjectStatusLog(
        project_id=project.id,
        from_status=old_status,
        to_status=req.status,
        changed_by=user.id,
        note=req.note
    )
    db.add(log)
    await db.commit()

    return {"message": "Status updated"}

@router.post("/{project_id}/files", response_model=ProjectFileResponse)
async def upload_file(
    project_id: UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    contents = await file.read()
    file_type = file.content_type or "application/octet-stream"
    file_url = f"uploads/{project_id}/{file.filename}"

    project_file = ProjectFile(
        project_id=project_id,
        uploaded_by=user.id,
        file_type=file_type,
        file_url=file_url,
        original_name=file.filename
    )
    db.add(project_file)
    await db.commit()
    await db.refresh(project_file)
    return project_file
