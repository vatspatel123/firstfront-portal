from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List
from datetime import datetime
from sqlalchemy import Date
from app.database import get_db
from app.models.lead import Lead, LeadStatus, FollowUp, SalesActivity
from app.schemas.lead import (LeadCreate, LeadResponse, LeadStatusUpdate,
                              FollowUpCreate, FollowUpResponse,
                              SalesActivityCreate, SalesActivityResponse)
from app.utils.auth import get_current_user, require_role

router = APIRouter()

@router.post("/", response_model=LeadResponse)
async def create_lead(req: LeadCreate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    lead = Lead(**req.model_dump())
    db.add(lead)
    await db.commit()
    await db.refresh(lead)
    return lead

@router.get("/", response_model=List[LeadResponse])
async def list_leads(status: str = None, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    query = select(Lead).order_by(Lead.created_at.desc())
    if status:
        query = query.where(Lead.status == LeadStatus(status))
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(lead_id: UUID, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@router.patch("/{lead_id}/status")
async def update_lead_status(lead_id: UUID, req: LeadStatusUpdate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    lead.status = LeadStatus(req.status)
    if req.assigned_to:
        lead.assigned_to = req.assigned_to
    await db.commit()
    return {"message": "Lead status updated"}

@router.post("/followups", response_model=FollowUpResponse)
async def create_followup(req: FollowUpCreate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    followup = FollowUp(**req.model_dump(), created_by=user.id)
    db.add(followup)
    await db.commit()
    await db.refresh(followup)
    return followup

@router.get("/followups/today")
async def get_today_followups(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    today = datetime.utcnow().date()
    result = await db.execute(
        select(FollowUp).where(
            FollowUp.next_followup_date.cast(Date) == today,
            FollowUp.status == "pending"
        ).order_by(FollowUp.created_at)
    )
    followups = result.scalars().all()
    return [
        {
            "id": str(f.id), "lead_id": str(f.lead_id), "note": f.note,
            "next_followup_date": f.next_followup_date.isoformat() if f.next_followup_date else None,
            "meeting_schedule": f.meeting_schedule.isoformat() if f.meeting_schedule else None,
            "status": f.status, "created_at": f.created_at.isoformat()
        }
        for f in followups
    ]

@router.patch("/followups/{followup_id}/status")
async def update_followup_status(
    followup_id: UUID,
    status: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    result = await db.execute(select(FollowUp).where(FollowUp.id == followup_id))
    followup = result.scalar_one_or_none()
    if not followup:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    followup.status = status
    await db.commit()
    return {"message": "Follow-up status updated"}

@router.post("/activities", response_model=SalesActivityResponse)
async def create_activity(req: SalesActivityCreate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    activity = SalesActivity(**req.model_dump(), user_id=user.id)
    db.add(activity)
    await db.commit()
    await db.refresh(activity)
    return activity

from sqlalchemy.orm import joinedload

@router.get("/activities")
async def list_activities(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(
        select(FollowUp)
        .options(joinedload(FollowUp.lead))
        .order_by(FollowUp.created_at.desc())
        .limit(50)
    )
    followups = result.scalars().all()
    return [
        {
            "id": str(f.id),
            "type": "call", # mock type for now since it's not stored
            "leadName": f.lead.name if f.lead else "Unknown",
            "company": f.lead.company if f.lead else "Unknown",
            "notes": f.note,
            "nextAction": f.status,
            "time": f.created_at.strftime("%I:%M %p")
        }
        for f in followups
    ]
