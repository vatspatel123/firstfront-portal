from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List
from app.database import get_db
from app.models.project import Project, ProjectFile, ProjectOutput
from app.schemas.project import ProjectFileResponse, ProjectOutputResponse
from app.utils.auth import get_current_user
from app.services.file_storage import save_upload, save_output, get_file_path, delete_file

router = APIRouter()

@router.post("/upload/{project_id}", response_model=ProjectFileResponse)
async def upload_project_file(
    project_id: UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    file_path = await save_upload(str(project_id), file)
    project_file = ProjectFile(
        project_id=project_id,
        uploaded_by=user.id,
        file_type=file.content_type or "application/octet-stream",
        file_url=file_path,
        original_name=file.filename
    )
    db.add(project_file)
    await db.commit()
    await db.refresh(project_file)
    return project_file

@router.post("/output/{project_id}", response_model=ProjectOutputResponse)
async def upload_project_output(
    project_id: UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    file_path = await save_output(str(project_id), file)
    output = ProjectOutput(
        project_id=project_id,
        uploaded_by=user.id,
        file_url=file_path,
        original_name=file.filename
    )
    db.add(output)
    await db.commit()
    await db.refresh(output)
    return output

@router.get("/{project_id}", response_model=List[ProjectFileResponse])
async def list_project_files(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    result = await db.execute(
        select(ProjectFile).where(ProjectFile.project_id == project_id).order_by(ProjectFile.created_at.desc())
    )
    return result.scalars().all()

@router.get("/download/{file_id}")
async def download_file(
    file_id: UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    result = await db.execute(select(ProjectFile).where(ProjectFile.id == file_id))
    file_record = result.scalar_one_or_none()
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")

    if file_record.file_url.startswith("s3://"):
        from app.services.file_storage import get_s3_client
        s3 = get_s3_client()
        if not s3:
            raise HTTPException(status_code=500, detail="S3 client not configured")
        
        parts = file_record.file_url.split("/", 3)
        bucket = parts[2]
        key = parts[3]
        
        try:
            from fastapi.concurrency import run_in_threadpool
            response = await run_in_threadpool(s3.get_object, Bucket=bucket, Key=key)
            from fastapi.responses import StreamingResponse
            return StreamingResponse(
                response['Body'],
                media_type=file_record.file_type or "application/octet-stream",
                headers={"Content-Disposition": f'attachment; filename="{file_record.original_name}"'}
            )
        except Exception as e:
            raise HTTPException(status_code=404, detail=f"S3 file download error: {e}")

    path = get_file_path(file_record.file_url)
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")

    return FileResponse(
        path=path,
        filename=file_record.original_name,
        media_type=file_record.file_type
    )

@router.delete("/{file_id}")
async def delete_project_file(
    file_id: UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    result = await db.execute(select(ProjectFile).where(ProjectFile.id == file_id))
    file_record = result.scalar_one_or_none()
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")

    delete_file(file_record.file_url)
    await db.delete(file_record)
    await db.commit()
    return {"message": "File deleted"}

@router.get("/outputs/{project_id}", response_model=List[ProjectOutputResponse])
async def list_project_outputs(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    result = await db.execute(
        select(ProjectOutput).where(ProjectOutput.project_id == project_id).order_by(ProjectOutput.created_at.desc())
    )
    return result.scalars().all()

@router.get("/download-output/{output_id}")
async def download_output(
    output_id: UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    result = await db.execute(select(ProjectOutput).where(ProjectOutput.id == output_id))
    output = result.scalar_one_or_none()
    if not output:
        raise HTTPException(status_code=404, detail="Output not found")

    if output.file_url.startswith("s3://"):
        from app.services.file_storage import get_s3_client
        s3 = get_s3_client()
        if not s3:
            raise HTTPException(status_code=500, detail="S3 client not configured")
        
        parts = output.file_url.split("/", 3)
        bucket = parts[2]
        key = parts[3]
        
        try:
            from fastapi.concurrency import run_in_threadpool
            response = await run_in_threadpool(s3.get_object, Bucket=bucket, Key=key)
            from fastapi.responses import StreamingResponse
            return StreamingResponse(
                response['Body'],
                media_type="application/octet-stream",
                headers={"Content-Disposition": f'attachment; filename="{output.original_name}"'}
            )
        except Exception as e:
            raise HTTPException(status_code=404, detail=f"S3 file download error: {e}")

    path = get_file_path(output.file_url)
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")

    return FileResponse(
        path=path,
        filename=output.original_name
    )
