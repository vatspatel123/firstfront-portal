from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from uuid import UUID
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models.project import Project, ProjectStatus, ProjectStatusLog
from app.models.client import Client
from app.models.note import InternalNote
from app.schemas.project import (ProjectCreate, ProjectResponse, ProjectStatusUpdate,
                                 ProjectFileResponse, ProjectOutputResponse, ProjectUpdate)
from app.utils.auth import get_current_user, get_current_client
from app.services.file_storage import delete_project_files

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

    result = await db.execute(
        select(Project)
        .options(joinedload(Project.client), joinedload(Project.designer))
        .where(Project.id == project.id)
    )
    return result.scalar_one()

@router.get("/", response_model=List[ProjectResponse])
async def list_projects(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    query = select(Project).options(joinedload(Project.client), joinedload(Project.designer))

    if user.role.value == "client":
        client = await db.execute(select(Client).where(Client.user_id == user.id))
        client = client.scalar_one_or_none()
        if not client:
            return []
        query = query.where(Project.client_id == client.id)

    if status:
        query = query.where(Project.status == ProjectStatus(status))
    if search:
        query = query.where(
            Project.name.ilike(f"%{search}%") |
            Project.location.ilike(f"%{search}%")
        )

    query = query.order_by(Project.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: UUID, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(
        select(Project)
        .options(joinedload(Project.client), joinedload(Project.designer))
        .where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: UUID,
    req: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = req.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    project.updated_at = datetime.utcnow()

    await db.commit()
    result = await db.execute(
        select(Project)
        .options(joinedload(Project.client), joinedload(Project.designer))
        .where(Project.id == project_id)
    )
    return result.scalar_one()

@router.delete("/{project_id}")
async def delete_project(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    delete_project_files(str(project_id))
    await db.delete(project)
    await db.commit()
    return {"message": "Project deleted"}

@router.get("/{project_id}/timeline")
async def get_project_timeline(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    result = await db.execute(
        select(ProjectStatusLog)
        .where(ProjectStatusLog.project_id == project_id)
        .order_by(ProjectStatusLog.created_at.asc())
    )
    logs = result.scalars().all()
    return [
        {
            "id": str(log.id),
            "from_status": log.from_status,
            "to_status": log.to_status,
            "note": log.note,
            "changed_by": str(log.changed_by),
            "created_at": log.created_at.isoformat()
        }
        for log in logs
    ]

@router.get("/{project_id}/files", response_model=List[ProjectFileResponse])
async def get_project_files(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    result = await db.execute(
        select(ProjectFile).where(ProjectFile.project_id == project_id).order_by(ProjectFile.created_at.desc())
    )
    return result.scalars().all()

@router.get("/{project_id}/outputs", response_model=List[ProjectOutputResponse])
async def get_project_outputs(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    result = await db.execute(
        select(ProjectOutput).where(ProjectOutput.project_id == project_id).order_by(ProjectOutput.created_at.desc())
    )
    return result.scalars().all()

@router.get("/{project_id}/notes")
async def get_project_notes(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    result = await db.execute(
        select(InternalNote).where(InternalNote.project_id == project_id).order_by(InternalNote.created_at.desc())
    )
    notes = result.scalars().all()
    return [
        {
            "id": str(note.id),
            "note": note.note,
            "created_by": str(note.created_by),
            "created_at": note.created_at.isoformat()
        }
        for note in notes
    ]

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
    project.updated_at = datetime.utcnow()

    log = ProjectStatusLog(
        project_id=project.id,
        from_status=old_status,
        to_status=req.status,
        changed_by=user.id,
        note=req.note
    )
    db.add(log)
    await db.commit()

    return {"message": "Status updated", "from": old_status, "to": req.status}
