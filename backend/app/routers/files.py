from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List
from pathlib import Path
from app.database import get_db
from app.models.project import ProjectFile, ProjectOutput
from app.schemas.project import ProjectFileResponse, ProjectOutputResponse
from app.utils.auth import get_current_user
from app.services.file_storage import save_upload, save_output, get_file_path

router = APIRouter()


@router.post("/upload/{project_id}", response_model=ProjectFileResponse)
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


@router.post("/output/{project_id}", response_model=ProjectOutputResponse)
async def upload_output(
    project_id: UUID,
    file: UploadFile = File(...),
    notes: str = None,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    file_url = await save_output(str(project_id), file)
    output = ProjectOutput(
        project_id=project_id,
        uploaded_by=user.id,
        file_url=file_url,
        original_name=file.filename,
        notes=notes
    )
    db.add(output)
    await db.commit()
    await db.refresh(output)
    return output


@router.get("/{project_id}", response_model=List[ProjectFileResponse])
async def list_files(project_id: UUID, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(
        select(ProjectFile).where(ProjectFile.project_id == project_id).order_by(ProjectFile.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{project_id}/outputs", response_model=List[ProjectOutputResponse])
async def list_outputs(project_id: UUID, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
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

    return FileResponse(
        path=str(file_path),
        filename=project_file.original_name,
        media_type=project_file.file_type
    )


@router.get("/download-output/{output_id}")
async def download_output(output_id: UUID, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(select(ProjectOutput).where(ProjectOutput.id == output_id))
    output = result.scalar_one_or_none()
    if not output:
        raise HTTPException(status_code=404, detail="Output not found")

    file_path = get_file_path(output.file_url)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")

    return FileResponse(
        path=str(file_path),
        filename=output.original_name,
        media_type="application/octet-stream"
    )
