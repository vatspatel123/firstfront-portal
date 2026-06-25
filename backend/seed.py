"""Seed script — creates sample data so you can see the UI populated."""
import asyncio, uuid
from datetime import datetime, timedelta
from app.database import async_session, engine, Base
from app.models.user import User, UserRole
from app.models.client import Client
from app.models.project import Project, ProjectStatus, ProjectStatusLog
from app.models.lead import Lead, LeadStatus, FollowUp
from app.models.note import Notification
from app.models.employee import Employee, LeaveRequest, LeaveStatus, LeaveType, PerformanceReview, EmployeeDocument
from app.models.message import Message, Invoice
from passlib.hash import bcrypt

async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        from sqlalchemy import select
        existing = await db.execute(select(User).limit(1))
        if existing.scalar_one_or_none():
            print("Already seeded")
            return

        # Admin user
        admin = User(
            id=uuid.uuid4(), name="Admin User", email="admin@firstfront.in", phone="9999999999",
            password_hash=bcrypt.hash("admin123"), role=UserRole.ADMIN,
            is_verified=True, is_active=True
        )
        db.add(admin)

        # Sales user
        sales_user = User(
            id=uuid.uuid4(), name="Sales Team", email="sales@firstfront.in", phone="9999999998",
            password_hash=bcrypt.hash("sales123"), role=UserRole.SALES,
            is_verified=True, is_active=True
        )
        db.add(sales_user)

        # Designer user (for login + assignment)
        designer_user = User(
            id=uuid.uuid4(), name="Priya Sharma", email="designer@firstfront.in", phone="9999999997",
            password_hash=bcrypt.hash("designer123"), role=UserRole.DESIGNER,
            is_verified=True, is_active=True
        )
        db.add(designer_user)

        # Client users
        clients_data = [
            ("acme@test.com", "8888888881", "Acme Solar Inc", "Rajesh Kumar", "Mumbai based solar installer"),
            ("green@test.com", "8888888882", "Green Energy Ltd", "Priya Sharma", "Commercial rooftop specialist"),
            ("sun@test.com", "8888888883", "SunPower Solutions", "Amit Patel", "Large scale ground mount"),
        ]
        clients = []
        for email, phone, company, person, details in clients_data:
            user = User(
                id=uuid.uuid4(), name=person, email=email, phone=phone,
                password_hash=bcrypt.hash("client123"), role=UserRole.CLIENT,
                is_verified=True, is_active=True
            )
            db.add(user)
            await db.flush()
            client = Client(
                user_id=user.id, company_name=company,
                contact_person=person, company_details=details
            )
            db.add(client)
            clients.append((user, client))

        # Projects
        projects_data = [
            ("Shanti Niketan Roof", "Mumbai, Maharashtra", "10", "residential", "Design + Installation", "high", "new"),
            ("GreenTech Office", "Pune, Maharashtra", "50", "commercial", "Feasibility + Design", "medium", "data_review"),
            ("Sunrise Factory", "Nagpur, Maharashtra", "200", "industrial", "Full EPC", "high", "missing_data"),
            ("Lake View Villa", "Lonavala", "8", "residential", "Design only", "low", "design_in_progress"),
            ("Mall Roof Project", "Thane", "100", "commercial", "Design + Installation", "medium", "assigned"),
        ]
        for (user, client), (name, loc, cap, ptype, services, priority, status_str) in zip(clients * 2, projects_data):
            deadline = datetime.utcnow() + timedelta(days=[7, 14, 21, 10, 5][projects_data.index((name, loc, cap, ptype, services, priority, status_str)) % 5])
            assigned = designer_user.id if status_str in ("assigned", "design_in_progress") else None
            project = Project(
                client_id=client.id, name=name, location=loc,
                capacity=cap, project_type=ptype, services_required=services,
                status=ProjectStatus(status_str), priority=priority, deadline=deadline,
                assigned_to=assigned
            )
            db.add(project)
            await db.flush()
            log = ProjectStatusLog(
                project_id=project.id, to_status=status_str,
                changed_by=clients[0][0].id, note="Project created"
            )
            db.add(log)

        # Leads
        leads_data = [
            ("Vikram Singh", "Bajaj Solar", "7777777771", "vikram@bajaj.com", "Need 50kW rooftop setup", LeadStatus.NEW),
            ("Neha Gupta", "Tata Power Green", "7777777772", "neha@tatapower.com", "300kW ground mount inquiry", LeadStatus.CONTACTED),
            ("Rohan Desai", "L&T Energy", "7777777773", "rohan@lt.com", "1MW solar farm proposal", LeadStatus.INTERESTED),
            ("Anita Verma", "HDFC Bank", "7777777774", "anita@hdfc.com", "Solar loan partner inquiry", LeadStatus.FOLLOWUP),
            ("Suresh Reddy", "Infosys Campus", "7777777775", "suresh@infosys.com", "5MW carport solar", LeadStatus.MEETING_SCHEDULED),
            ("Deepak Joshi", "Adani Solar", "7777777776", "deepak@adani.com", "Manufacturing partnership", LeadStatus.QUOTATION_SENT),
            ("Kavita Nair", "Godrej Properties", "7777777777", "kavita@godrej.com", "New housing project solar", LeadStatus.NEW),
            ("Arun Mehra", "Welspun Energy", "7777777778", "arun@welspun.com", "O&M contract renewal", LeadStatus.LOST),
        ]
        lead_ids = []
        for name, company, phone, email, req, status in leads_data:
            lead = Lead(
                name=name, company=company, phone=phone, email=email,
                requirement=req, status=status, lead_score=50
            )
            db.add(lead)
            await db.flush()
            lead_ids.append(lead.id)

        # Follow-ups for leads
        followups_data = [
            (lead_ids[1], "Follow up on site visit for 300kW ground mount", datetime.utcnow() + timedelta(days=2), "pending", sales_user.id),
            (lead_ids[2], "Send updated proposal with revised pricing", datetime.utcnow() + timedelta(days=3), "pending", sales_user.id),
            (lead_ids[3], "Schedule call to discuss partnership terms", datetime.utcnow() + timedelta(days=1), "completed", sales_user.id),
            (lead_ids[4], "Confirm meeting time for Infosys campus visit", datetime.utcnow() + timedelta(days=5), "pending", sales_user.id),
            (lead_ids[5], "Send quotation for manufacturing partnership", datetime.utcnow() + timedelta(days=4), "pending", admin.id),
        ]
        for lead_id, note, next_date, fb_status, created_by in followups_data:
            followup = FollowUp(
                lead_id=lead_id, note=note,
                next_followup_date=next_date,
                status=fb_status, created_by=created_by
            )
            db.add(followup)

        # Notifications for admin
        for msg in [
            "New lead created: Vikram Singh (Bajaj Solar)",
            "Project 'Shanti Niketan Roof' status changed to data_review",
            "Follow-up reminder: Contact Neha Gupta",
        ]:
            notif = Notification(
                user_id=admin.id, type="info", message=msg, is_read=False
            )
            db.add(notif)

        # ── Employees ──
        employees_data = [
            ("Priya Sharma", "Senior Designer", "design", "priya@firstfront.in", "+919876511111", "2022-03-15", "1200000", "PS"),
            ("Vikram Singh", "Designer", "design", "vikram@firstfront.in", "+919876522222", "2023-01-20", "850000", "VS"),
            ("Ananya Iyer", "Junior Designer", "design", "ananya@firstfront.in", "+919876533333", "2024-06-01", "500000", "AI"),
            ("Rohan Mehta", "Designer", "design", "rohan@firstfront.in", "+919876544444", "2023-08-10", "800000", "RM"),
            ("Sneha Reddy", "Senior Designer", "design", "sneha@firstfront.in", "+919876555555", "2021-11-05", "1350000", "SR"),
            ("Karthik Patel", "Designer", "design", "karthik@firstfront.in", "+919876566666", "2024-02-15", "750000", "KP"),
            ("Neha Kapoor", "Sales Lead", "sales", "neha@firstfront.in", "+919876588888", "2023-04-12", "900000", "NK"),
            ("Rahul Desai", "QA Engineer", "quality", "rahul@firstfront.in", "+919876599999", "2022-09-20", "1050000", "RD"),
            ("Pooja Nair", "Accountant", "finance", "pooja@firstfront.in", "+919876510101", "2023-11-08", "700000", "PN"),
            ("Meera Saxena", "HR Manager", "hr", "meera@firstfront.in", "+919876530303", "2021-07-15", "1100000", "MS"),
        ]
        employee_ids = []
        for name, role, dept, email, phone, join, salary, avatar in employees_data:
            emp_user = User(
                id=uuid.uuid4(), email=email, phone=phone,
                password_hash=bcrypt.hash("employee123"), role=UserRole.DESIGNER,
                is_verified=True, is_active=True
            )
            db.add(emp_user)
            await db.flush()
            emp = Employee(
                user_id=emp_user.id, name=name, role=role, department=dept,
                email=email, phone=phone, join_date=datetime.strptime(join, "%Y-%m-%d"), salary=salary,
                status="active", avatar=avatar
            )
            db.add(emp)
            await db.flush()
            employee_ids.append(emp.id)

        # ── Leave Requests ──
        leaves_data = [
            (employee_ids[0], "sick", "2024-11-21", "2024-11-22", 2, "Fever and rest", "pending"),
            (employee_ids[1], "casual", "2024-11-25", "2024-11-26", 2, "Family function", "pending"),
            (employee_ids[2], "earned", "2024-12-23", "2024-12-30", 8, "Year-end vacation", "approved"),
            (employee_ids[3], "sick", "2024-11-18", "2024-11-18", 1, "Doctor appointment", "approved"),
            (employee_ids[5], "wfh", "2024-11-22", "2024-11-22", 1, "Internet installation at home", "pending"),
        ]
        for emp_id, ltype, from_d, to_d, days, reason, status in leaves_data:
            leave = LeaveRequest(
                employee_id=emp_id, type=ltype,
                from_date=datetime.strptime(from_d, "%Y-%m-%d"),
                to_date=datetime.strptime(to_d, "%Y-%m-%d"),
                days=days, reason=reason, status=status
            )
            db.add(leave)

        # ── Performance Reviews ──
        reviews_data = [
            (employee_ids[0], "Q3 2024", 4.8, "Technical depth, client communication", "Could mentor juniors more actively"),
            (employee_ids[1], "Q3 2024", 4.2, "Fast turnaround, CEIG expertise", "Documentation could be more thorough"),
            (employee_ids[4], "Q3 2024", 4.9, "Exceptional design quality, leadership", "Take on more complex projects"),
            (employee_ids[2], "Q3 2024", 3.8, "Eagerness to learn, on-time delivery", "Shadow analysis accuracy needs work"),
        ]
        for emp_id, period, rating, strengths, improvements in reviews_data:
            review = PerformanceReview(
                employee_id=emp_id, period=period, rating=rating,
                reviewer_id=admin.id, status="completed",
                strengths=strengths, improvements=improvements,
                date=datetime.utcnow()
            )
            db.add(review)

        # ── Invoices ──
        # (using the first two clients and projects)
        invoices_data = [
            ("INV-2024-103", "25000", "paid", "UPI"),
            ("INV-2024-098", "45000", "pending", ""),
            ("INV-2024-087", "120000", "paid", "NEFT"),
            ("INV-2024-076", "32000", "overdue", ""),
        ]
        # get project ids
        proj_result = await db.execute(select(Project))
        proj_ids = [p.id for p in proj_result.scalars().all()]
        client_result = await db.execute(select(Client))
        cli_ids = [c.id for c in client_result.scalars().all()]

        for (inv_no, amount, status, method), proj_id, cli_id in zip(
            invoices_data, proj_ids * 2, cli_ids * 2
        ):
            inv = Invoice(
                project_id=proj_id, client_id=cli_id,
                amount=amount, status=status, method=method
            )
            db.add(inv)

        # ── Messages ──
        msgs_data = [
            "Hi! I've started reviewing the site photos. Quick question — the KML file shows the roof tilted 18°, is that correct?",
            "Yes, that's the actual tilt angle. The roof faces south-west.",
            "Perfect. I'll account for that in the shadow analysis. I'll have the initial report ready by tomorrow.",
            "I've uploaded the first draft of the shadow analysis report. Let me know if you have any feedback!",
        ]
        for i, text in enumerate(msgs_data):
            msg = Message(
                project_id=proj_ids[0],
                sender_id=admin.id if i % 2 == 0 else clients[0][0].id,
                text=text,
                read=True if i < 3 else False
            )
            db.add(msg)

        await db.commit()
        print("\n=== SEED COMPLETE — LOGIN CREDENTIALS ===")
        print("  Admin:     admin@firstfront.in     / admin123")
        print("  Sales:     sales@firstfront.in     / sales123")
        print("  Designer:  designer@firstfront.in  / designer123")
        print("  Client:    acme@test.com           / client123")
        print("  Client:    green@test.com          / client123")
        print("  Client:    sun@test.com            / client123")
        print("==========================================\n")

asyncio.run(seed())
