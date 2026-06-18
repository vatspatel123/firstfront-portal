from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.config import get_settings
from app.database import engine, Base, get_db
from app.routers import auth, projects, leads, files, ai, dashboard, notifications, employees, messages

settings = get_settings()

app = FastAPI(title="First Front Portal & CRM", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/api/diagnose")
async def diagnose(db: AsyncSession = Depends(get_db)):
    status = {
        "database": "unknown",
        "storage": "unknown"
    }
    
    # 1. Test Database Connection
    try:
        await db.execute(text("SELECT 1"))
        status["database"] = "connected"
    except Exception as e:
        status["database"] = f"failed: {str(e)}"
        
    # 2. Test Backblaze B2 / S3 Connection
    try:
        from app.services.file_storage import get_s3_client
        s3 = get_s3_client()
        if s3:
            from fastapi.concurrency import run_in_threadpool
            await run_in_threadpool(
                s3.list_objects_v2,
                Bucket=settings.s3_bucket_name,
                MaxKeys=1
            )
            status["storage"] = f"connected (bucket: {settings.s3_bucket_name})"
        else:
            status["storage"] = "not_configured (credentials missing)"
    except Exception as e:
        status["storage"] = f"failed: {str(e)}"
        
    return status

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(leads.router, prefix="/api/leads", tags=["Leads"])
app.include_router(files.router, prefix="/api/files", tags=["Files"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(employees.router, prefix="/api/employees", tags=["Employees"])
app.include_router(messages.router, prefix="/api/messages", tags=["Messages"])
