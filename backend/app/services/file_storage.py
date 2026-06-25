import os
import shutil
from pathlib import Path
from fastapi import UploadFile, HTTPException
from fastapi.concurrency import run_in_threadpool
from app.config import get_settings

settings = get_settings()

UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("outputs")

ALLOWED_UPLOAD_TYPES = {
    "application/pdf", "image/jpeg", "image/png", "image/webp", "image/tiff",
    "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv", "application/zip", "application/x-zip-compressed",
    "application/dwg", "application/dxf",
    "text/plain", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
MAX_UPLOAD_SIZE_MB = 50


async def validate_upload(file: UploadFile):
    if file.content_type and file.content_type not in ALLOWED_UPLOAD_TYPES:
        ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename and "." in file.filename else ""
        if ext not in {"pdf", "jpg", "jpeg", "png", "webp", "tiff", "tif", "xlsx", "xls", "csv", "zip", "dwg", "dxf", "txt", "doc", "docx"}:
            raise HTTPException(status_code=400, detail=f"File type '{file.content_type}' is not allowed.")
    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File exceeds {MAX_UPLOAD_SIZE_MB}MB limit.")
    await file.seek(0)

for d in [UPLOAD_DIR, OUTPUT_DIR]:
    d.mkdir(exist_ok=True)

def get_s3_client():
    if not settings.s3_access_key or not settings.s3_secret_key:
        return None
    
    import boto3
    client_kwargs = {
        "aws_access_key_id": settings.s3_access_key,
        "aws_secret_access_key": settings.s3_secret_key,
    }
    if settings.s3_endpoint:
        client_kwargs["endpoint_url"] = settings.s3_endpoint
    
    return boto3.client("s3", **client_kwargs)

async def save_upload(project_id: str, file: UploadFile) -> str:
    content = await file.read()
    
    s3 = get_s3_client()
    if s3:
        key = f"uploads/{project_id}/{file.filename}"
        try:
            await run_in_threadpool(
                s3.put_object,
                Bucket=settings.s3_bucket_name,
                Key=key,
                Body=content,
                ContentType=file.content_type or "application/octet-stream"
            )
            return f"s3://{settings.s3_bucket_name}/{key}"
        except Exception as e:
            print(f"S3 upload failed: {e}. Falling back to local storage.")
    
    project_dir = UPLOAD_DIR / project_id
    project_dir.mkdir(parents=True, exist_ok=True)
    file_path = project_dir / file.filename
    file_path.write_bytes(content)
    return str(file_path)

async def save_output(project_id: str, file: UploadFile) -> str:
    content = await file.read()

    s3 = get_s3_client()
    if s3:
        key = f"outputs/{project_id}/{file.filename}"
        try:
            await run_in_threadpool(
                s3.put_object,
                Bucket=settings.s3_bucket_name,
                Key=key,
                Body=content,
                ContentType=file.content_type or "application/octet-stream"
            )
            return f"s3://{settings.s3_bucket_name}/{key}"
        except Exception as e:
            print(f"S3 output upload failed: {e}. Falling back to local storage.")

    project_dir = OUTPUT_DIR / project_id
    project_dir.mkdir(parents=True, exist_ok=True)
    file_path = project_dir / file.filename
    file_path.write_bytes(content)
    return str(file_path)

def get_file_path(relative_path: str) -> Path:
    return Path(relative_path)

def delete_file(file_url: str):
    if file_url.startswith("s3://"):
        s3 = get_s3_client()
        if s3:
            parts = file_url.split("/", 3)
            bucket = parts[2]
            key = parts[3]
            try:
                s3.delete_object(Bucket=bucket, Key=key)
            except Exception as e:
                print(f"S3 delete failed: {e}")
        return

    path = Path(file_url)
    if path.exists():
        path.unlink()

def delete_project_files(project_id: str):
    # For S3, we would typically list and delete objects with prefix. 
    # For now, this is mainly called locally.
    for d in [UPLOAD_DIR, OUTPUT_DIR]:
        project_dir = d / project_id
        if project_dir.exists():
            shutil.rmtree(project_dir)
