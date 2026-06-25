import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { LayoutDashboard, Users, Briefcase, CalendarCheck, BarChart3, Activity, Settings, LogOut, Bell } from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { path: '/sales', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/sales/leads', label: 'Leads', icon: Users },
  { path: '/sales/projects', label: 'Projects', icon: Briefcase },
  { path: '/sales/followups', label: 'Follow-ups', icon: CalendarCheck },
  { path: '/sales/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/sales/activity', label: 'Activity Log', icon: Activity },
  { path: '/sales/notifications', label: 'Notifications', icon: Bell },
  { path: '/sales/settings', label: 'Settings', icon: Settings },
]

export default function SalesLayout() {
  const { logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-primary-800 text-white flex flex-col">
        <div className="p-4">
          <img src="/logo.svg" alt="First Front Solar Energy" className="w-full h-auto" />
          <p className="text-xs text-primary-200 mt-1 ml-1">Sales</p>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
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
          <div className="text-sm text-primary-200 mb-2">Sales Team</div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-primary-200 hover:text-white">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
