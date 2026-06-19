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
    allow_origin_regex=r"https://.*\.netlify\.app|http://localhost(:\d+)?|http://127\.0\.0\.1(:\d+)?",
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

@app.get("/api/seed")
async def seed_database(secret: str = ""):
    """One-time seed endpoint — call with ?secret=firstfront2024seed to populate demo data."""
    if secret != "firstfront2024seed":
        return {"error": "Invalid secret key. Access denied."}

    try:
        from sqlalchemy import select
        from app.models.user import User
        from app.database import async_session
        async with async_session() as db:
            existing = await db.execute(select(User).limit(1))
            if existing.scalar_one_or_none():
                return {"status": "already_seeded", "message": "Database already has data. No changes made."}

        # Run the full seed
        import uuid
        from datetime import datetime
        from app.database import async_session
        from app.models.user import User, UserRole
        from app.models.client import Client
        from app.models.project import Project, ProjectStatus, ProjectStatusLog
        from app.models.lead import Lead, LeadStatus
        from app.models.note import Notification
        from app.models.employee import Employee, Department, EmployeeStatus
        from app.models.message import Message, Invoice
        from passlib.hash import bcrypt

        async with async_session() as db:
            # Admin
            admin = User(
                id=uuid.uuid4(), name="Admin User", email="admin@firstfront.in", phone="9999999999",
                password_hash=bcrypt.hash("admin123"), role=UserRole.ADMIN,
                is_verified=True, is_active=True
            )
            db.add(admin)

            # Sales
            sales_user = User(
                id=uuid.uuid4(), name="Sales Team", email="sales@firstfront.in", phone="9999999998",
                password_hash=bcrypt.hash("sales123"), role=UserRole.SALES,
                is_verified=True, is_active=True
            )
            db.add(sales_user)
            await db.flush()

            # Clients
            clients_data = [
                ("acme@test.com", "8888888881", "Acme Solar Inc", "Rajesh Kumar", "Mumbai based solar installer"),
                ("green@test.com", "8888888882", "Green Energy Ltd", "Priya Sharma", "Commercial rooftop specialist"),
                ("sun@test.com", "8888888883", "SunPower Solutions", "Amit Patel", "Large scale ground mount"),
            ]
            clients = []
            for c_email, c_phone, company, person, details in clients_data:
                c_user = User(
                    id=uuid.uuid4(), name=person, email=c_email, phone=c_phone,
                    password_hash=bcrypt.hash("client123"), role=UserRole.CLIENT,
                    is_verified=True, is_active=True
                )
                db.add(c_user)
                await db.flush()
                client = Client(user_id=c_user.id, company_name=company, contact_person=person, company_details=details)
                db.add(client)
                await db.flush()
                clients.append((c_user, client))

            # Projects
            projects_data = [
                ("Shanti Niketan Roof", "Mumbai, Maharashtra", "10", "residential", "Design + Installation"),
                ("GreenTech Office", "Pune, Maharashtra", "50", "commercial", "Feasibility + Design"),
                ("Sunrise Factory", "Nagpur, Maharashtra", "200", "industrial", "Full EPC"),
                ("Lake View Villa", "Lonavala", "8", "residential", "Design only"),
                ("Mall Roof Project", "Thane", "100", "commercial", "Design + Installation"),
            ]
            all_statuses = list(ProjectStatus)
            proj_ids = []
            for i, (p_name, loc, cap, ptype, services) in enumerate(projects_data):
                _, p_client = clients[i % len(clients)]
                project = Project(
                    client_id=p_client.id, name=p_name, location=loc,
                    capacity=cap, project_type=ptype, services_required=services,
                    status=all_statuses[i % len(all_statuses)]
                )
                db.add(project)
                await db.flush()
                proj_ids.append(project.id)
                db.add(ProjectStatusLog(
                    project_id=project.id, to_status=project.status.value,
                    changed_by=admin.id, note="Project created"
                ))

            # Leads
            for l_name, l_company, l_phone, l_email, req, l_status in [
                ("Vikram Singh", "Bajaj Solar", "7777777771", "vikram@bajaj.com", "50kW rooftop", LeadStatus.NEW),
                ("Neha Gupta", "Tata Power", "7777777772", "neha@tata.com", "300kW ground mount", LeadStatus.CONTACTED),
                ("Rohan Desai", "L&T Energy", "7777777773", "rohan@lt.com", "1MW solar farm", LeadStatus.INTERESTED),
                ("Anita Verma", "HDFC Bank", "7777777774", "anita@hdfc.com", "Solar loan inquiry", LeadStatus.FOLLOWUP),
            ]:
                db.add(Lead(
                    name=l_name, company=l_company, phone=l_phone,
                    email=l_email, requirement=req, status=l_status, lead_score=50
                ))

            # Notifications
            for n_msg in [
                "New lead: Vikram Singh (Bajaj Solar)",
                "Project 'Shanti Niketan Roof' updated",
                "Follow-up: Contact Neha Gupta"
            ]:
                db.add(Notification(user_id=admin.id, type="info", message=n_msg, is_read=False))

            # Employees — use correct Department enum values
            dept_map = {
                "design": Department.DESIGN,
                "sales": Department.SALES,
                "hr": Department.HR,
            }
            emp_data = [
                ("Priya Sharma", "Senior Designer", "design", "priya@firstfront.in", "+919876511111", "2022-03-15", "1200000", "PS"),
                ("Vikram Singh", "Designer", "design", "vikram.d@firstfront.in", "+919876522222", "2023-01-20", "850000", "VS"),
                ("Sneha Reddy", "Senior Designer", "design", "sneha@firstfront.in", "+919876555555", "2021-11-05", "1350000", "SR"),
                ("Neha Kapoor", "Sales Lead", "sales", "neha.k@firstfront.in", "+919876588888", "2023-04-12", "900000", "NK"),
                ("Meera Saxena", "HR Manager", "hr", "meera@firstfront.in", "+919876530303", "2021-07-15", "1100000", "MS"),
            ]
            for e_name, e_role, e_dept, e_email, e_phone, e_join, e_salary, e_avatar in emp_data:
                emp_user = User(
                    id=uuid.uuid4(), name=e_name, email=e_email, phone=e_phone,
                    password_hash=bcrypt.hash("employee123"), role=UserRole.DESIGNER,
                    is_verified=True, is_active=True
                )
                db.add(emp_user)
                await db.flush()
                db.add(Employee(
                    user_id=emp_user.id, name=e_name, role=e_role,
                    department=dept_map[e_dept], email=e_email, phone=e_phone,
                    join_date=datetime.strptime(e_join, "%Y-%m-%d"),
                    salary=e_salary, status=EmployeeStatus.ACTIVE, avatar=e_avatar
                ))

            # Invoices
            cli_ids = [c.id for _, c in clients]
            for (inv_no, inv_amount, inv_status, inv_method), p_id, c_id in zip(
                [("INV-001","25000","paid","UPI"), ("INV-002","45000","pending",""), ("INV-003","120000","paid","NEFT")],
                proj_ids,
                cli_ids * 3
            ):
                db.add(Invoice(project_id=p_id, client_id=c_id, amount=inv_amount, status=inv_status, method=inv_method))

            # Messages
            for i, m_text in enumerate([
                "Hi! I've started reviewing the site photos. Is the roof tilt 18 degrees correct?",
                "Yes, that's correct. The roof faces south-west.",
                "Perfect. I'll have the shadow analysis ready by tomorrow.",
            ]):
                db.add(Message(
                    project_id=proj_ids[0],
                    sender_id=admin.id if i % 2 == 0 else clients[0][0].id,
                    text=m_text, read=True
                ))

            await db.commit()

        return {
            "status": "success",
            "message": "Database seeded successfully!",
            "accounts": {
                "admin": {"email": "admin@firstfront.in", "password": "admin123"},
                "sales": {"email": "sales@firstfront.in", "password": "sales123"},
                "client": {"email": "acme@test.com", "password": "client123"},
                "designer": {"email": "priya@firstfront.in", "password": "employee123"}
            }
        }
    except Exception as e:
        import traceback
        return {"status": "error", "message": str(e), "trace": traceback.format_exc()}

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(leads.router, prefix="/api/leads", tags=["Leads"])
app.include_router(files.router, prefix="/api/files", tags=["Files"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(employees.router, prefix="/api/employees", tags=["Employees"])
app.include_router(messages.router, prefix="/api/messages", tags=["Messages"])
