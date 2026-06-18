from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import Optional
from pydantic import BaseModel
from app.database import get_db
from app.models.project import Project, ProjectFile
from app.utils.auth import get_current_user
from app.services.ai_service import get_ai_provider

router = APIRouter()


class AISummaryRequest(BaseModel):
    project_id: UUID
    prompt: Optional[str] = None


class AIChatRequest(BaseModel):
    project_id: UUID
    message: str


@router.post("/summarize")
async def ai_summarize(
    req: AISummaryRequest,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    result = await db.execute(select(Project).where(Project.id == req.project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    files_result = await db.execute(
        select(ProjectFile).where(ProjectFile.project_id == req.project_id)
    )
    files = files_result.scalars().all()

    context = (
        f"Project: {project.name}\n"
        f"Location: {project.location}\n"
        f"Capacity: {project.capacity} kW\n"
        f"Type: {project.project_type}\n"
        f"Services: {project.services_required}\n"
        f"Status: {project.status.value}\n"
        f"Files uploaded: {len(files)}\n"
        f"Notes: {project.notes or 'None'}"
    )

    ai = get_ai_provider()
    prompt = req.prompt or "Provide a concise professional summary of this solar project, highlighting key details and current status."

    try:
        summary = await ai.generate(
            prompt=f"{prompt}\n\nProject details:\n{context}",
            system="You are a solar energy project analyst. Provide concise, actionable summaries.",
        )
    except Exception:
        summary = f"AI summary unavailable. Project: {project.name}, Status: {project.status.value}, Capacity: {project.capacity} kW"

    return {"summary": summary, "project_name": project.name}


@router.post("/missing-data")
async def detect_missing_data(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    files_result = await db.execute(
        select(ProjectFile).where(ProjectFile.project_id == project_id)
    )
    files = files_result.scalars().all()

    checks = {
        "has_location": bool(project.location),
        "has_capacity": bool(project.capacity),
        "has_services": bool(project.services_required),
        "has_notes": bool(project.notes),
        "has_files": len(files) > 0,
    }
    missing = [k.replace("has_", "") for k, v in checks.items() if not v]

    # Optionally use AI for intelligent suggestions
    ai = get_ai_provider()
    suggestions = ""
    if missing:
        try:
            suggestions = await ai.generate(
                prompt=f"A solar project is missing: {', '.join(missing)}. Suggest what the client should provide.",
                system="You are a solar design project coordinator. Be specific about solar project requirements.",
                max_tokens=256,
            )
        except Exception:
            suggestions = ""

    return {
        "project_id": str(project_id),
        "checks": checks,
        "missing_fields": missing,
        "suggestions": suggestions,
    }


@router.post("/chat")
async def ai_chat(
    req: AIChatRequest,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    """Per-project AI chat — answers questions about the project."""
    result = await db.execute(select(Project).where(Project.id == req.project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    context = (
        f"Project: {project.name}, Location: {project.location}, "
        f"Capacity: {project.capacity} kW, Type: {project.project_type}, "
        f"Services: {project.services_required}, Status: {project.status.value}"
    )

    ai = get_ai_provider()
    try:
        reply = await ai.generate(
            prompt=f"Context about the solar project:\n{context}\n\nUser question: {req.message}",
            system=(
                "You are an AI assistant for First Front Solar, a solar design company. "
                "Answer questions about the project concisely and helpfully. "
                "If you don't know something specific, say so."
            ),
        )
    except Exception:
        reply = "AI is currently unavailable. Please try again later."

    return {"reply": reply}
