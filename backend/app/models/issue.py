import uuid
from datetime import datetime
from sqlalchemy import String, ForeignKey, DateTime, Enum as SAEnum, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum
from app.database import Base

class IssueStatus(str, enum.Enum):
    OPEN = "open"
    RESOLVED = "resolved"

class IssueLog(Base):
    __tablename__ = "issue_logs"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("projects.id"))
    description: Mapped[str] = mapped_column(Text)
    status: Mapped[IssueStatus] = mapped_column(SAEnum(IssueStatus), default=IssueStatus.OPEN)
    resolved_by: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id"), nullable=True)
    resolution_notes: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="issues")
