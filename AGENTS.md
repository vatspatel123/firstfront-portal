# First Front Solar — Portal & CRM

## Project
Solar design Client Portal & CRM at `/Users/agamshah/firstfront-portal/`

## Tech Stack
- **Backend:** Python + FastAPI + SQLAlchemy (async) + SQLite (dev) / PostgreSQL (prod)
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Design:** Google Stitch (stitch.withgoogle.com)
- **UI Lib:** lucide-react icons, react-hot-toast, zustand, react-router-dom v6

## Commands
```sh
# Backend
cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend && npm run dev

# Seed data
cd backend && source venv/bin/activate && python seed.py
```

## Design System
- Primary: blue (#1e40af) — `primary-*` in tailwind.config
- Accent: amber (#f59e0b) — `solar-*` in tailwind.config  
- Cards: white, border, rounded-xl, hover shadow
- Status pills: small rounded-full colored badges
- Loading: centered blue spinner
- Empty states: icon + message + optional action

## Key Patterns
- Shared API client in `src/utils/api.ts` with error interceptor
- Auth state in `src/store/authStore.ts` (zustand + persist)
- Protected routes via `ProtectedRoute` wrapper in App.tsx
- Backend auth via `get_current_user` / `get_current_client` / `require_role`
- All DB operations async with `get_db` session dependency
