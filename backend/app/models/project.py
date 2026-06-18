import uuid
from datetime import datetime
from sqlalchemy import String, ForeignKey, DateTime, Enum as SAEnum, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum
from app.database import Base

class ProjectStatus(str, enum.Enum):
    NEW = "new"
    DATA_REVIEW = "data_review"
    MISSING_DATA = "missing_data"
    DATA_COMPLETE = "data_complete"
    ASSIGNED = "assigned"
    DESIGN_IN_PROGRESS = "design_in_progress"
    QA_REVIEW = "qa_review"
    APPROVED = "approved"
    DELIVERED = "delivered"

class Project(Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    client_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("clients.id"))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str] = mapped_column(String(500))
    capacity: Mapped[str] = mapped_column(String(100))
    project_type: Mapped[str] = mapped_column(String(100))
    services_required: Mapped[str] = mapped_column(Text)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[ProjectStatus] = mapped_column(SAEnum(ProjectStatus), default=ProjectStatus.NEW)
    assigned_to: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    client = relationship("Client", back_populates="projects")
    designer = relationship("User", foreign_keys=[assigned_to])
    files = relationship("ProjectFile", back_populates="project")
    outputs = relationship("ProjectOutput", back_populates="project")
    status_logs = relationship("ProjectStatusLog", back_populates="project")
    issues = relationship("IssueLog", back_populates="project")

    @property
    def client_name(self) -> str:
        return self.client.company_name if self.client else ""

    @property
    def designer_name(self) -> str:
        return self.designer.name if self.designer else "Unassigned"


class ProjectFile(Base):
    __tablename__ = "project_files"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("projects.id"))
    uploaded_by: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id"))
    file_type: Mapped[str] = mapped_column(String(50))
    file_url: Mapped[str] = mapped_column(String(1000))
    original_name: Mapped[str] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="files")


class ProjectOutput(Base):
    __tablename__ = "project_outputs"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("projects.id"))
    uploaded_by: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id"))
    file_url: Mapped[str] = mapped_column(String(1000))
    original_name: Mapped[str] = mapped_column(String(500))
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="outputs")


class ProjectStatusLog(Base):
    __tablename__ = "project_status_logs"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("projects.id"))
    from_status: Mapped[str] = mapped_column(String(50), nullable=True)
    to_status: Mapped[str] = mapped_column(String(50))
    changed_by: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id"))
    note: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="status_logs")
