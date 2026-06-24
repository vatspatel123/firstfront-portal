from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List
from app.database import get_db
from app.models.message import Message, Invoice
from app.models.project import Project
from app.models.user import User
from app.schemas.employee import MessageCreate, MessageResponse, InvoiceCreate, InvoiceResponse
from app.utils.auth import get_current_user

router = APIRouter()


# ── Messages ──

@router.get("/", response_model=List[MessageResponse])
async def list_messages(project_id: UUID = None, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    query = select(Message).order_by(Message.created_at.desc())
    if project_id:
        query = query.where(Message.project_id == project_id)
    result = await db.execute(query)
    messages = result.scalars().all()

    response = []
    for msg in messages:
        user_result = await db.execute(select(User).where(User.id == msg.sender_id))
        sender = user_result.scalar_one_or_none()
        response.append(MessageResponse(
            id=msg.id,
            project_id=msg.project_id,
            sender_id=msg.sender_id,
            text=msg.text,
            read=msg.read,
            created_at=msg.created_at,
            sender_name=sender.name if sender else "",
            sender_avatar=""
        ))
    return response


@router.post("/", response_model=MessageResponse)
async def send_message(req: MessageCreate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    msg = Message(
        project_id=req.project_id,
        sender_id=user.id,
        text=req.text,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    return MessageResponse(
        id=msg.id,
        project_id=msg.project_id,
        sender_id=msg.sender_id,
        text=msg.text,
        read=msg.read,
        created_at=msg.created_at,
        sender_name=user.name or user.email,
        sender_avatar=""
    )


@router.patch("/{message_id}/read")
async def mark_read(message_id: UUID, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(select(Message).where(Message.id == message_id))
    msg = result.scalar_one_or_none()
    if msg:
        msg.read = True
        await db.commit()
    return {"message": "Marked as read"}


# ── Invoices ──

@router.get("/invoices/", response_model=List[InvoiceResponse])
async def list_invoices(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(select(Invoice).order_by(Invoice.created_at.desc()))
    invoices = result.scalars().all()

    response = []
    for inv in invoices:
        proj_result = await db.execute(select(Project).where(Project.id == inv.project_id))
        proj = proj_result.scalar_one_or_none()
        response.append(InvoiceResponse(
            id=inv.id,
            project_id=inv.project_id,
            client_id=inv.client_id,
            amount=inv.amount,
            status=inv.status,
            method=inv.method or "",
            created_at=inv.created_at,
            project_name=proj.name if proj else ""
        ))
    return response


@router.post("/invoices/", response_model=InvoiceResponse)
async def create_invoice(req: InvoiceCreate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    inv = Invoice(
        project_id=req.project_id,
        client_id=req.client_id,
        amount=req.amount,
        method=req.method,
    )
    db.add(inv)
    await db.commit()
    await db.refresh(inv)

    proj_result = await db.execute(select(Project).where(Project.id == inv.project_id))
    proj = proj_result.scalar_one_or_none()

    return InvoiceResponse(
        id=inv.id,
        project_id=inv.project_id,
        client_id=inv.client_id,
        amount=inv.amount,
        status=inv.status,
        method=inv.method or "",
        created_at=inv.created_at,
        project_name=proj.name if proj else ""
    )
