import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { LayoutDashboard, Users, Briefcase, CalendarCheck, LogOut, Sun } from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { path: '/crm', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/crm/leads', label: 'Leads', icon: Users },
  { path: '/crm/projects', label: 'Projects', icon: Briefcase },
  { path: '/crm/followups', label: 'Follow-ups', icon: CalendarCheck },
]

export default function CrmLayout() {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-primary-800 text-white flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <Sun className="h-8 w-8 text-solar-500" />
          <div>
            <h1 className="font-bold text-lg">First Front</h1>
            <p className="text-xs text-primary-200">CRM System</p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                location.pathname === item.path
                  ? 'bg-primary-700 text-white'
                  : 'text-primary-200 hover:bg-primary-700/50 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-primary-700">
          <div className="text-sm text-primary-200 mb-2 capitalize">{user?.role}</div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-primary-200 hover:text-white">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
