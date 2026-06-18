import uuid
from datetime import datetime
from sqlalchemy import String, ForeignKey, DateTime, Enum as SAEnum, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum
from app.database import Base

class EmployeeStatus(str, enum.Enum):
    ACTIVE = "active"
    PROBATION = "probation"
    INACTIVE = "inactive"

class Department(str, enum.Enum):
    DESIGN = "design"
    OPERATIONS = "operations"
    SALES = "sales"
    QUALITY = "quality"
    FINANCE = "finance"
    HR = "hr"

class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id"), unique=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(255), nullable=False)
    department: Mapped[Department] = mapped_column(SAEnum(Department), default=Department.DESIGN)
    email: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str] = mapped_column(String(20))
    join_date: Mapped[datetime] = mapped_column(DateTime)
    salary: Mapped[str] = mapped_column(String(100))
    status: Mapped[EmployeeStatus] = mapped_column(SAEnum(EmployeeStatus), default=EmployeeStatus.ACTIVE)
    avatar: Mapped[str] = mapped_column(String(10))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id])
    leave_requests = relationship("LeaveRequest", back_populates="employee")
    reviews = relationship("PerformanceReview", back_populates="employee")
    documents = relationship("EmployeeDocument", back_populates="employee")


class LeaveType(str, enum.Enum):
    SICK = "sick"
    CASUAL = "casual"
    EARNED = "earned"
    WFH = "wfh"

class LeaveStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    employee_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("employees.id"))
    type: Mapped[LeaveType] = mapped_column(SAEnum(LeaveType))
    from_date: Mapped[datetime] = mapped_column(DateTime)
    to_date: Mapped[datetime] = mapped_column(DateTime)
    days: Mapped[int] = mapped_column(default=1)
    reason: Mapped[str] = mapped_column(Text)
    status: Mapped[LeaveStatus] = mapped_column(SAEnum(LeaveStatus), default=LeaveStatus.PENDING)
    reviewed_by: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    employee = relationship("Employee", back_populates="leave_requests")


class PerformanceReview(Base):
    __tablename__ = "performance_reviews"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    employee_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("employees.id"))
    period: Mapped[str] = mapped_column(String(50))
    rating: Mapped[float] = mapped_column(default=0.0)
    reviewer_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id"))
    status: Mapped[str] = mapped_column(String(20), default="pending")
    strengths: Mapped[str] = mapped_column(Text, nullable=True)
    improvements: Mapped[str] = mapped_column(Text, nullable=True)
    date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    employee = relationship("Employee", back_populates="reviews")


class EmployeeDocument(Base):
    __tablename__ = "employee_documents"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    employee_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("employees.id"))
    name: Mapped[str] = mapped_column(String(255))
    file_url: Mapped[str] = mapped_column(String(1000))
    size: Mapped[str] = mapped_column(String(50))
    uploaded: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    employee = relationship("Employee", back_populates="documents")
