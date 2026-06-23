from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import engine, Base
from app.routers import auth, projects, leads, files, ai, dashboard, messages, employees, notifications

settings = get_settings()

app = FastAPI(title="First Front Portal & CRM", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "https://clever-dusk-256fb7.netlify.app", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Auto-seed if no users exist
    from sqlalchemy import select
    from app.models.user import User
    from app.database import async_session
    async with async_session() as db:
        existing = await db.execute(select(User).limit(1))
        if not existing.scalar_one_or_none():
            import uuid
            from datetime import datetime
            from app.models.user import UserRole
            from app.models.client import Client
            from app.models.project import Project, ProjectStatus, ProjectStatusLog
            from app.models.lead import Lead, LeadStatus
            from app.models.note import Notification
            from app.models.employee import Employee, LeaveRequest, PerformanceReview
            from app.models.message import Message, Invoice
            from passlib.hash import bcrypt

            admin = User(id=uuid.uuid4(), name="Admin User", email="admin@firstfront.in", phone="9999999999",
                password_hash=bcrypt.hash("admin123"), role=UserRole.ADMIN, is_verified=True, is_active=True)
            db.add(admin)
            sales_user = User(id=uuid.uuid4(), name="Sales Team", email="sales@firstfront.in", phone="9999999998",
                password_hash=bcrypt.hash("sales123"), role=UserRole.SALES, is_verified=True, is_active=True)
            db.add(sales_user)
            designer_user = User(id=uuid.uuid4(), name="Priya Sharma", email="designer@firstfront.in", phone="9999999997",
                password_hash=bcrypt.hash("designer123"), role=UserRole.DESIGNER, is_verified=True, is_active=True)
            db.add(designer_user)

            clients = []
            for email, phone, company, person in [
                ("acme@test.com", "8888888881", "Acme Solar Inc", "Rajesh Kumar"),
                ("green@test.com", "8888888882", "Green Energy Ltd", "Priya Sharma"),
            ]:
                user = User(id=uuid.uuid4(), name=person, email=email, phone=phone,
                    password_hash=bcrypt.hash("client123"), role=UserRole.CLIENT, is_verified=True, is_active=True)
                db.add(user)
                await db.flush()
                client = Client(user_id=user.id, company_name=company, contact_person=person)
                db.add(client)
                clients.append((user, client))

            statuses = list(ProjectStatus)
            for i, (name, loc, cap, ptype) in enumerate([
                ("Shanti Niketan Roof", "Mumbai", "10", "residential"),
                ("GreenTech Office", "Pune", "50", "commercial"),
                ("Sunrise Factory", "Nagpur", "200", "industrial"),
            ]):
                user, client = clients[i % len(clients)]
                project = Project(client_id=client.id, name=name, location=loc, capacity=cap,
                    project_type=ptype, services_required="Design + Installation", status=statuses[i % len(statuses)])
                db.add(project)
                await db.flush()
                log = ProjectStatusLog(project_id=project.id, to_status=project.status.value,
                    changed_by=user.id, note="Project created")
                db.add(log)

            for name, company, phone, email, req, status in [
                ("Vikram Singh", "Bajaj Solar", "7777777771", "vikram@bajaj.com", "50kW rooftop", LeadStatus.NEW),
                ("Neha Gupta", "Tata Power", "7777777772", "neha@tata.com", "300kW ground mount", LeadStatus.CONTACTED),
                ("Rohan Desai", "L&T Energy", "7777777773", "rohan@lt.com", "1MW solar farm", LeadStatus.INTERESTED),
            ]:
                db.add(Lead(name=name, company=company, phone=phone, email=email, requirement=req, status=status, lead_score=50))

            for msg in ["New lead: Vikram Singh", "Project Shanti Niketan status updated"]:
                db.add(Notification(user_id=admin.id, type="info", message=msg, is_read=False))

            await db.commit()

@app.get("/health")
async def health():
    return {"status": "ok"}

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(leads.router, prefix="/api/leads", tags=["Leads"])
app.include_router(files.router, prefix="/api/files", tags=["Files"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(messages.router, prefix="/api/messages", tags=["Messages"])
app.include_router(employees.router, prefix="/api/employees", tags=["Employees"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
