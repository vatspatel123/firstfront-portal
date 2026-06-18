# First Front Solar — Complete Project Documentation

## 1. Project Overview

**First Front Solar** is a full-stack solar design Client Portal & CRM platform. It enables solar energy companies to manage client projects, assign designers, track progress, handle billing, and communicate with stakeholders — all in one place.

**Live URL:** https://boisterous-cat-f080ea.netlify.app  
**Local Frontend:** http://localhost:5173  
**Local Backend:** http://localhost:8000  
**API Docs:** http://localhost:8000/docs

---

## 2. Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI framework |
| TypeScript | 5.5.4 | Type safety |
| Vite | 5.4.7 | Build tool & dev server |
| Tailwind CSS | 3.4.12 | Utility-first styling |
| React Router DOM | 6.26.2 | Client-side routing |
| Zustand | 4.5.5 | State management |
| Axios | 1.7.7 | HTTP client |
| react-hot-toast | 2.4.1 | Toast notifications |
| lucide-react | 0.441.0 | Icon library |
| date-fns | 3.6.0 | Date formatting |
| Uppy | 4.1.0 | File uploads |
| vite-plugin-pwa | 0.20.5 | Progressive Web App |

### Backend
| Technology | Purpose |
|---|---|
| Python 3.11+ | Runtime |
| FastAPI | Web framework |
| SQLAlchemy (async) | ORM |
| SQLite (dev) / PostgreSQL (prod) | Database |
| python-jose | JWT tokens |
| passlib (bcrypt) | Password hashing |
| Pydantic | Data validation |
| aiosqlite | Async SQLite driver |

### Deployment
| Service | Purpose |
|---|---|
| Netlify | Frontend hosting |
| Vercel/Railway/Render | Backend hosting (production) |
| Supabase | PostgreSQL (production) |
| Resend | Email OTP delivery |
| Twilio | SMS OTP delivery |
| S3-compatible | File storage |

---

## 3. Project Structure

```
firstfront-portal/
├── AGENTS.md                    # AI agent instructions
├── opencode.json                # OpenCode config
│
├── backend/
│   ├── .env                     # Environment variables
│   ├── firstfront.db            # SQLite database (dev)
│   ├── requirements.txt         # Python dependencies
│   ├── seed.py                  # Database seed script
│   │
│   └── app/
│       ├── __init__.py
│       ├── config.py            # Settings (env vars)
│       ├── database.py          # SQLAlchemy engine + session
│       ├── main.py              # FastAPI app entry point
│       │
│       ├── models/              # SQLAlchemy models
│       │   ├── __init__.py      # All model imports
│       │   ├── user.py          # User + UserRole enum
│       │   ├── client.py        # Client (linked to User)
│       │   ├── project.py       # Project + Files + Outputs + StatusLog
│       │   ├── lead.py          # Lead + FollowUp + SalesActivity
│       │   ├── employee.py      # Employee + Leave + Review + Document
│       │   ├── message.py       # Message + Invoice + ActivityLog
│       │   ├── note.py          # InternalNote + Notification
│       │   ├── issue.py         # IssueLog
│       │   └── otp.py           # OTPCode
│       │
│       ├── routers/             # API route handlers
│       │   ├── __init__.py
│       │   ├── auth.py          # Signup, Login, OTP verify/resend
│       │   ├── projects.py      # CRUD + status + timeline + files
│       │   ├── employees.py     # Employees + leave + reviews
│       │   ├── messages.py      # Messages + invoices
│       │   ├── notifications.py # Notifications + unread count
│       │   ├── leads.py         # Lead management
│       │   ├── dashboard.py     # Dashboard stats
│       │   ├── files.py         # File upload/download
│       │   └── ai.py            # AI endpoints (Groq/OpenAI)
│       │
│       ├── schemas/             # Pydantic request/response
│       │   ├── __init__.py
│       │   ├── user.py          # SignupRequest, LoginRequest, LoginResponse
│       │   ├── project.py       # ProjectCreate, ProjectResponse
│       │   ├── employee.py      # Employee schemas
│       │   └── lead.py          # Lead schemas
│       │
│       ├── services/
│       │   ├── __init__.py
│       │   └── file_storage.py  # S3 file upload/delete
│       │
│       └── utils/
│           ├── __init__.py
│           ├── auth.py          # get_current_user, require_role
│           ├── jwt.py           # create_access_token, decode_token
│           └── otp.py           # OTP generate + send (Resend/Twilio)
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── vite.config.ts
    ├── netlify.toml             # SPA redirect config
    │
    ├── public/
    │   └── vite.svg
    │
    └── src/
        ├── main.tsx             # Entry point (BrowserRouter + Toaster)
        ├── App.tsx              # Routes + Sidebar + Navbar
        ├── index.css            # Tailwind + Lexend/Inter fonts
        ├── vite-env.d.ts
        │
        ├── components/
        │   ├── ProtectedRoute.tsx    # Auth guard
        │   ├── layout/
        │   │   └── Navbar.tsx        # Header + role switcher + notifications
        │   └── ui/
        │       ├── ErrorBoundary.tsx  # Error fallback UI
        │       └── Skeleton.tsx       # Loading skeleton components
        │
        ├── pages/
        │   ├── auth/
        │   │   ├── Login.tsx         # Email/password login
        │   │   ├── Signup.tsx        # Registration form
        │   │   └── VerifyOTP.tsx     # 6-digit OTP verification
        │   │
        │   ├── client/
        │   │   ├── MyProjects.tsx    # Project list (search + status groups)
        │   │   ├── NewProjectWizard.tsx  # 4-step project creation
        │   │   ├── ProjectDetail.tsx # Project detail (files, outputs, timeline)
        │   │   └── Billing.tsx       # Invoices + payment history
        │   │
        │   ├── designer/
        │   │   ├── DesignerDayView.tsx   # Daily task cards
        │   │   └── ProjectWorkspace.tsx  # Design checklist + file upload
        │   │
        │   ├── admin/
        │   │   ├── ManagementOverview.tsx # Admin KPIs + alerts
        │   │   ├── ProjectBoard.tsx      # Kanban drag-drop (6 columns)
        │   │   ├── ProjectAssignment.tsx # Designer assignment
        │   │   ├── TeamManagement.tsx    # Designer list + capacity
        │   │   ├── EmployeeDirectory.tsx # Employee cards (search + filter)
        │   │   ├── LeaveAttendance.tsx   # Leave approve/reject
        │   │   ├── PerformanceDocs.tsx   # Reviews + document storage
        │   │   ├── CapacityCalendar.tsx  # Calendar + workload bars
        │   │   └── Analytics.tsx         # Charts + KPIs
        │   │
        │   └── shared/
        │       ├── Dashboard.tsx     # Role-aware dashboard
        │       ├── Messages.tsx      # Per-project chat
        │       ├── Notifications.tsx # Notification list
        │       ├── ActivityLog.tsx   # Activity feed
        │       ├── Settings.tsx      # Profile/security/notifications
        │       └── NotFound.tsx      # 404 page
        │
        ├── store/
        │   ├── authStore.ts      # Auth state (token, user, login/logout)
        │   ├── useDemoStore.ts   # Demo role switching (persist)
        │   └── useApiStores.ts   # All API stores (employees, leave, reviews, messages, invoices, projects, notifications)
        │
        └── utils/
            ├── api.ts            # Axios instance with JWT interceptor
            ├── mockData.ts       # Mock data for UI preview
            └── extendedMockData.ts # Extended mock data (HR/PM)
```

---

## 4. Design System

### Brand Colors
| Token | Hex | Usage |
|---|---|---|
| `brand-500` | `#0160a0` | Primary blue — buttons, links, accents |
| `brand-600` | `#014e85` | Primary hover state |
| `brand-700` | `#013d6a` | Primary active state |
| `sun-400` | `#ffc229` | Gold accent — logo, highlights |
| `sun-500` | `#f39c12` | Solar amber — badges, warnings |

### Status Colors
| Status | Background | Text | Usage |
|---|---|---|---|
| Success | `bg-success-bg` | `text-success` | Approved, delivered, paid |
| Warning | `bg-warning-bg` | `text-warning` | Pending, needs attention |
| Error | `bg-error-bg` | `text-error` | Overdue, rejected, high priority |

### Typography
- **Headings:** Lexend (font-display)
- **Body:** Inter (font-sans)
- **Monospace:** System monospace

### Component Patterns
- **Cards:** `card` class — white bg, border, rounded-xl, shadow-card
- **Hover cards:** `card-hover` — adds hover shadow elevation
- **Buttons:** `btn-primary` (blue), `btn-secondary` (outline), `btn-ghost` (text)
- **Status pills:** `status-pill` — small rounded-full colored badges
- **Input fields:** `input-field` — border, rounded-lg, focus ring
- **Skeleton loading:** `Skeleton`, `SkeletonCard`, `SkeletonList`, `SkeletonStats`

---

## 5. Authentication System

### Flow
1. **Signup** → `POST /api/auth/signup` → Creates User + Client → Sends OTP via email/SMS
2. **Verify OTP** → `POST /api/auth/verify-otp` → Sets `is_verified = True`
3. **Login** → `POST /api/auth/login` → Returns JWT access token
4. **Token stored** in localStorage as `firstfront-token`
5. **Auto-attach** via Axios request interceptor → `Authorization: Bearer <token>`
6. **401 handling** → Response interceptor clears token + redirects to `/login`
7. **Logout** → Clears token from localStorage + zustand store

### User Roles
| Role | Access |
|---|---|
| `client` | Dashboard, My Projects, New Project, Billing, Messages, Settings |
| `designer` | Dashboard, Today (tasks), Workspace, Messages, Settings |
| `admin` | All admin pages + all shared pages |

### Backend Auth Middleware
- `get_current_user()` — Extracts Bearer token, decodes JWT, fetches User from DB
- `get_current_client()` — Requires `UserRole.CLIENT`
- `require_role(role)` — Factory that returns a role-checking dependency (admin always passes)

---

## 6. API Endpoints

### Auth (`/api/auth`)
| Method | Path | Description |
|---|---|---|
| POST | `/signup` | Register new account |
| POST | `/login` | Authenticate, get JWT |
| POST | `/verify-otp` | Verify OTP code |
| POST | `/resend-otp` | Resend OTP |

### Projects (`/api/projects`)
| Method | Path | Description |
|---|---|---|
| POST | `/` | Create project (client only) |
| GET | `/` | List projects (filtered by role) |
| GET | `/{id}` | Get project detail |
| PUT | `/{id}` | Update project |
| DELETE | `/{id}` | Delete project |
| PATCH | `/{id}/status` | Update status + log |
| GET | `/{id}/timeline` | Get status change history |
| GET | `/{id}/files` | Get uploaded files |
| GET | `/{id}/outputs` | Get output files |
| GET | `/{id}/notes` | Get internal notes |

### Employees (`/api/employees`)
| Method | Path | Description |
|---|---|---|
| GET | `/` | List employees |
| GET | `/leave/` | List leave requests |
| PATCH | `/leave/{id}` | Approve/reject leave |
| GET | `/reviews/` | List performance reviews |
| GET | `/documents/` | List employee documents |

### Messages (`/api/messages`)
| Method | Path | Description |
|---|---|---|
| GET | `/` | List messages (optionally by project_id) |
| POST | `/` | Send message |
| GET | `/invoices/` | List invoices |

### Notifications (`/api/notifications`)
| Method | Path | Description |
|---|---|---|
| GET | `/` | List notifications |
| GET | `/unread-count` | Get unread count |
| PATCH | `/{id}/read` | Mark one as read |
| POST | `/mark-all-read` | Mark all as read |

### Dashboard (`/api/dashboard`)
| Method | Path | Description |
|---|---|---|
| GET | `/stats` | Get dashboard statistics |

### Leads (`/api/leads`)
| Method | Path | Description |
|---|---|---|
| GET | `/` | List leads |
| POST | `/` | Create lead |
| PATCH | `/{id}` | Update lead |
| POST | `/{id}/follow-up` | Add follow-up |

---

## 7. Frontend Pages

### Auth Pages
| Route | Component | Description |
|---|---|---|
| `/login` | `Login.tsx` | Email + password form |
| `/signup` | `Signup.tsx` | Registration form (name, company, email, phone, password) |
| `/verify-otp` | `VerifyOTP.tsx` | 6-digit OTP input with auto-focus, paste, resend |

### Client Pages
| Route | Component | Description |
|---|---|---|
| `/` | `Dashboard` | Client dashboard — active projects, stats |
| `/new-project` | `NewProjectWizard` | 4-step wizard: Service → Details → Location → Confirm |
| `/projects` | `MyProjects` | Project list with search, active/delivered groups |
| `/projects/:id` | `ProjectDetail` | Project detail — files, outputs, timeline, quick message |
| `/billing` | `Billing` | Invoices list, total paid/pending stats |

### Designer Pages
| Route | Component | Description |
|---|---|---|
| `/designer/tasks` | `DesignerDayView` | Daily task cards with priority badges |
| `/designer/workspace` | `ProjectWorkspace` | Design checklist + file upload |

### Admin Pages
| Route | Component | Description |
|---|---|---|
| `/admin` | `ManagementOverview` | KPIs, alerts, all projects list |
| `/admin/board` | `ProjectBoard` | Kanban board (6 columns, drag-drop) |
| `/admin/assign` | `ProjectAssignment` | Assign designers to projects |
| `/admin/team` | `TeamManagement` | Designer list + capacity bars |
| `/admin/employees` | `EmployeeDirectory` | Employee cards (search + department filter) |
| `/admin/leave` | `LeaveAttendance` | Leave requests (approve/reject) + weekly calendar |
| `/admin/performance` | `PerformanceDocs` | Performance reviews + employee documents |
| `/admin/capacity` | `CapacityCalendar` | Monthly calendar + workload sidebar |
| `/admin/analytics` | `Analytics` | KPI cards, bar charts, service breakdown |

### Shared Pages
| Route | Component | Description |
|---|---|---|
| `/messages` | `Messages` | Per-project chat thread |
| `/notifications` | `Notifications` | Notification list with mark-all-read |
| `/activity` | `ActivityLog` | Activity feed grouped by date |
| `/settings` | `Settings` | Profile, security, notification settings |
| `/404` | `NotFound` | 404 page |

---

## 8. State Management

### Zustand Stores

**`authStore.ts`** — Authentication
```typescript
{ token, user, isAuthenticated, login(), signup(), verifyOTP(), resendOTP(), logout() }
```

**`useDemoStore.ts`** — Demo role switching (persisted)
```typescript
{ role, setRole(), notifications }
```

**`useApiStores.ts`** — All API data stores:
- `useEmployeeStore` — employees, fetchEmployees()
- `useLeaveStore` — leaves, fetchLeaves(), approveLeave(), rejectLeave()
- `useReviewStore` — reviews, fetchReviews()
- `useMessageStore` — messages, fetchMessages(), sendMessage()
- `useInvoiceStore` — invoices, fetchInvoices()
- `useProjectStore` — projects, fetchProjects(), updateStatus(), assignDesigner()
- `useNotificationStore` — notifications, unreadCount, fetchNotifications(), markRead(), markAllRead()

---

## 9. Database Schema

### Users
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | String(255) | Display name |
| email | String(255) | Unique |
| phone | String(20) | Unique |
| password_hash | String(255) | bcrypt hash |
| role | Enum | client, sales, designer, admin |
| is_verified | Boolean | OTP verified |
| is_active | Boolean | Account active |
| created_at | DateTime | |
| updated_at | DateTime | |

### Projects
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| client_id | UUID | FK → clients.id |
| name | String(255) | Project name |
| location | String(500) | Site location |
| capacity | String(100) | e.g. "10" (kW) |
| project_type | String(100) | residential/commercial/industrial |
| services_required | Text | Comma-separated services |
| notes | Text | Optional |
| status | Enum | new, data_review, missing_data, data_complete, assigned, design_in_progress, ready, delivered |
| assigned_to | UUID | FK → users.id (designer) |
| created_at | DateTime | |
| updated_at | DateTime | |

### Employees
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | FK → users.id |
| name | String(255) | |
| role | String(100) | Job title |
| department | String(100) | design, sales, quality, finance, hr |
| email | String(255) | |
| phone | String(20) | |
| join_date | DateTime | |
| salary | String(50) | |
| status | String(50) | active, probation, inactive |
| avatar | String(10) | Initials |

### Other Tables
- **Clients** — company_name, contact_person, company_details
- **Leads** — name, company, phone, email, requirement, status, lead_score
- **LeaveRequests** — employee_id, type, from_date, to_date, days, reason, status
- **PerformanceReviews** — employee_id, period, rating, reviewer_id, strengths, improvements
- **EmployeeDocuments** — employee_id, name, type, size, url
- **Messages** — project_id, sender_id, text, read
- **Invoices** — project_id, client_id, amount, status, method
- **Notifications** — user_id, type, message, is_read
- **ActivityLog** — user_id, action, target, project_id
- **ProjectFiles** — project_id, uploaded_by, file_type, file_url, original_name
- **ProjectOutputs** — project_id, uploaded_by, file_url, original_name, notes
- **ProjectStatusLogs** — project_id, from_status, to_status, changed_by, note
- **OTPCode** — email, phone, code, purpose, is_used, expires_at

---

## 10. Environment Variables

### Backend `.env`
```
DATABASE_URL=sqlite+aiosqlite:///./firstfront.db
SECRET_KEY=change-me-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
OTP_EXPIRE_MINUTES=5
RESEND_API_KEY=
FROM_EMAIL=support@firstfront.in
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
S3_ENDPOINT=                  # Backblaze B2 S3 endpoint, e.g., https://s3.us-west-004.backblazeb2.com
S3_ACCESS_KEY=                # Backblaze Application Key ID
S3_SECRET_KEY=                # Backblaze Application Key
S3_BUCKET_NAME=               # Backblaze Bucket Name (e.g., firstfront-files)
AI_PROVIDER=groq
GROQ_API_KEY=
OPENAI_API_KEY=
FRONTEND_URL=http://localhost:5173
```

---

## 11. Seed Data

### Login Credentials
| Role | Email | Password |
|---|---|---|
| Admin | admin@firstfront.in | admin123 |
| Client | acme@test.com | client123 |
| Client | green@test.com | client123 |
| Client | sun@test.com | client123 |

### Seeded Records
- 1 Admin user
- 3 Client users + client profiles
- 5 Projects (various statuses)
- 8 Leads (various stages)
- 3 Notifications (admin)
- 10 Employees (6 design, 1 sales, 1 quality, 1 finance, 1 HR)
- 5 Leave requests (2 pending, 2 approved, 1 pending)
- 4 Performance reviews
- 4 Invoices (2 paid, 1 pending, 1 overdue)
- 4 Messages (project conversation)

---

## 12. Key Commands

```bash
# ── Backend ──
cd backend
source venv/bin/activate
python seed.py                    # Seed database
uvicorn app.main:app --reload --port 8000  # Start backend

# ── Frontend ──
cd frontend
npm install                       # Install dependencies
npm run dev                       # Start dev server (port 5173)
npm run build                     # Production build
npx tsc --noEmit                  # TypeScript check

# ── Deploy to Netlify ──
cd frontend
npm run build
netlify deploy --dir=dist --prod

# ── Reset Database ──
cd backend
rm firstfront.db
source venv/bin/activate
python seed.py
```

---

## 13. Pages Wired to Real API

| Page | Store | API Endpoint |
|---|---|---|
| Dashboard (all roles) | useProjectStore, useAuthStore | GET /api/projects, auth |
| MyProjects | useProjectStore | GET /api/projects |
| ManagementOverview | useProjectStore | GET /api/projects |
| Billing | useInvoiceStore | GET /api/messages/invoices |
| Messages | useMessageStore, useProjectStore | GET/POST /api/messages, GET /api/projects |
| EmployeeDirectory | useEmployeeStore | GET /api/employees |
| LeaveAttendance | useLeaveStore | GET/PATCH /api/employees/leave |
| PerformanceDocs | useReviewStore | GET /api/employees/reviews |
| Notifications | useNotificationStore | GET/PATCH/POST /api/notifications |
| Navbar (bell) | useNotificationStore | GET /api/notifications/unread-count |

## 14. Pages Still Using Mock Data

| Page | Mock Data | Reason |
|---|---|---|
| ProjectBoard | ALL_PROJECTS_BOARD, EMPLOYEES | Needs designer name/avatar join |
| ProjectAssignment | ALL_PROJECTS_BOARD, EMPLOYEES | Needs designer list with department |
| CapacityCalendar | CALENDAR_DEADLINES, EMPLOYEES | Needs project deadlines + designer info |
| TeamManagement | Hardcoded designers array | Needs designer workload stats endpoint |
| Settings | MOCK_USER | Needs user profile GET/PATCH endpoint |
| NewProjectWizard | SERVICE_TYPES | Can remain as static config |
| Analytics | Hardcoded monthlyData, kpiCards | Needs analytics aggregation endpoint |
| DesignerDayView | MOCK_DESIGNER_TASKS | Needs task model/endpoint |
| ActivityLog | Hardcoded activities array | Needs activity log endpoint |

---

## 15. Deployment Checklist

- [ ] Set production environment variables
- [ ] Switch DATABASE_URL to PostgreSQL
- [ ] Configure Backblaze B2 (Free Plan) file storage
- [ ] Set up Resend API key for email OTP
- [ ] Set up Twilio for SMS OTP
- [ ] Configure CORS for production frontend URL
- [ ] Set SECRET_KEY to a secure random value
- [ ] Run migrations on production database
- [ ] Seed initial admin user
- [ ] Deploy backend to hosting service
- [ ] Update frontend API base URL to production backend
- [ ] Deploy frontend to Netlify
- [ ] Test auth flow end-to-end
- [ ] Test project creation flow
- [ ] Test file upload flow

---

## 16. Known Limitations

1. **No task model** — DesignerDayView uses mock data; needs a Task table
2. **No user profile endpoint** — Settings page uses mock data; needs GET/PATCH /api/users/me
3. **No analytics aggregation** — Analytics page uses hardcoded data; needs backend aggregation queries
4. **No real-time updates** — Messages and notifications require page refresh; could add WebSockets
5. **Default Local Storage fallback** — File uploads work out-of-the-box locally and transparently switch to Backblaze B2 once credentials are configured in .env
6. **No password reset** — No forgot password flow implemented
7. **No refresh tokens** — JWT expires after 24h with no refresh mechanism

---

*Generated for First Front Solar Portal — June 2025*
