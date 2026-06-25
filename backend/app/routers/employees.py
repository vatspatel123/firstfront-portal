from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List
from app.database import get_db
from app.models.employee import Employee, LeaveRequest, LeaveStatus, PerformanceReview, EmployeeDocument
from app.models.user import User
from app.schemas.employee import (
    EmployeeCreate, EmployeeResponse, LeaveCreate, LeaveResponse, LeaveUpdate,
    ReviewCreate, ReviewResponse
)
from app.utils.auth import get_current_user

router = APIRouter()

# ── Employee ──

@router.get("/", response_model=List[EmployeeResponse])
async def list_employees(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(select(Employee).order_by(Employee.name))
    return result.scalars().all()


@router.post("/", response_model=EmployeeResponse)
async def create_employee(req: EmployeeCreate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    join_date = req.join_date
    if isinstance(join_date, str):
        from datetime import datetime
        join_date = datetime.strptime(join_date, "%Y-%m-%d").date()
    employee = Employee(
        user_id=user.id,
        name=req.name,
        role=req.role,
        department=req.department,
        email=req.email,
        phone=req.phone,
        join_date=join_date,
        salary=req.salary,
        avatar=req.avatar[:2] if req.avatar else req.name[:2].upper()
    )
    db.add(employee)
    await db.commit()
    await db.refresh(employee)
    return employee


@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(employee_id: UUID, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    emp = result.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp


# ── Leave ──

@router.get("/leave/", response_model=List[LeaveResponse])
async def list_leave(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(select(LeaveRequest).order_by(LeaveRequest.created_at.desc()))
    leaves = result.scalars().all()
    response = []
    for leave in leaves:
        emp_result = await db.execute(select(Employee).where(Employee.id == leave.employee_id))
        emp = emp_result.scalar_one_or_none()
        lr = LeaveResponse(
            id=leave.id,
            employee_id=leave.employee_id,
            type=leave.type.value if hasattr(leave.type, 'value') else leave.type,
            from_date=leave.from_date,
            to_date=leave.to_date,
            days=leave.days,
            reason=leave.reason,
            status=leave.status.value if hasattr(leave.status, 'value') else leave.status,
            employee_name=emp.name if emp else ""
        )
        response.append(lr)
    return response


@router.post("/leave/", response_model=LeaveResponse)
async def create_leave(req: LeaveCreate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    leave = LeaveRequest(
        employee_id=req.employee_id,
        type=req.type,
        from_date=req.from_date,
        to_date=req.to_date,
        days=req.days,
        reason=req.reason,
    )
    db.add(leave)
    await db.commit()
    await db.refresh(leave)

    emp_result = await db.execute(select(Employee).where(Employee.id == leave.employee_id))
    emp = emp_result.scalar_one_or_none()

    return LeaveResponse(
        id=leave.id,
        employee_id=leave.employee_id,
        type=leave.type.value if hasattr(leave.type, 'value') else leave.type,
        from_date=leave.from_date,
        to_date=leave.to_date,
        days=leave.days,
        reason=leave.reason,
        status=leave.status.value if hasattr(leave.status, 'value') else leave.status,
        employee_name=emp.name if emp else ""
    )


@router.patch("/leave/{leave_id}")
async def update_leave(leave_id: UUID, req: LeaveUpdate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(select(LeaveRequest).where(LeaveRequest.id == leave_id))
    leave = result.scalar_one_or_none()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    leave.status = LeaveStatus(req.status)
    if req.reviewed_by:
        leave.reviewed_by = req.reviewed_by
    await db.commit()
    return {"message": f"Leave {req.status}"}


# ── Performance Reviews ──

@router.get("/reviews/", response_model=List[ReviewResponse])
async def list_reviews(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(select(PerformanceReview).order_by(PerformanceReview.created_at.desc()))
    reviews = result.scalars().all()
    response = []
    for r in reviews:
        emp_result = await db.execute(select(Employee).where(Employee.id == r.employee_id))
        emp = emp_result.scalar_one_or_none()
        rr = ReviewResponse(
            id=r.id,
            employee_id=r.employee_id,
            period=r.period,
            rating=r.rating,
            reviewer_id=r.reviewer_id,
            status=r.status,
            strengths=r.strengths or "",
            improvements=r.improvements or "",
            employee_name=emp.name if emp else "",
            employee_avatar=emp.avatar if emp else ""
        )
        response.append(rr)
    return response


@router.post("/reviews/", response_model=ReviewResponse)
async def create_review(req: ReviewCreate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    review = PerformanceReview(
        employee_id=req.employee_id,
        period=req.period,
        rating=req.rating,
        reviewer_id=user.id,
        strengths=req.strengths,
        improvements=req.improvements,
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)

    emp_result = await db.execute(select(Employee).where(Employee.id == review.employee_id))
    emp = emp_result.scalar_one_or_none()

    return ReviewResponse(
        id=review.id,
        employee_id=review.employee_id,
        period=review.period,
        rating=review.rating,
        reviewer_id=review.reviewer_id,
        status=review.status,
        strengths=review.strengths or "",
        improvements=review.improvements or "",
        employee_name=emp.name if emp else "",
        employee_avatar=emp.avatar if emp else ""
    )


# ── Employee Documents ──

@router.get("/{employee_id}/documents")
async def list_employee_documents(employee_id: UUID, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(
        select(EmployeeDocument).where(EmployeeDocument.employee_id == employee_id)
    )
    docs = result.scalars().all()
    return [
        {"id": str(d.id), "name": d.name, "size": d.size, "uploaded": d.uploaded.isoformat()}
        for d in docs
    ]
