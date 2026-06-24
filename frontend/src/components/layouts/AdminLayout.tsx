import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { LayoutDashboard, Users, BarChart3, Calendar, ClipboardList, UserCheck, FileText, Settings, LogOut, Sun, Bell, Briefcase, CalendarCheck } from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/projects', label: 'Project Board', icon: ClipboardList },
  { path: '/admin/assign', label: 'Assign Projects', icon: Briefcase },
  { path: '/admin/team', label: 'Design Team', icon: Users },
  { path: '/admin/employees', label: 'Employees', icon: UserCheck },
  { path: '/admin/leaves', label: 'Leave & Attendance', icon: CalendarCheck },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/admin/capacity', label: 'Capacity', icon: Calendar },
  { path: '/admin/performance', label: 'Performance', icon: FileText },
  { path: '/admin/notifications', label: 'Notifications', icon: Bell },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout() {
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
        <div className="p-6 flex items-center gap-3">
          <Sun className="h-8 w-8 text-solar-500" />
          <div>
            <h1 className="font-bold text-lg">First Front</h1>
            <p className="text-xs text-primary-200">Admin Panel</p>
          </div>
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
          <div className="text-sm text-primary-200 mb-2">Admin</div>
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
