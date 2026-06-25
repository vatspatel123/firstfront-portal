import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { LayoutDashboard, PlusCircle, History, LogOut, FolderOpen, CreditCard, Bell, Settings } from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { path: '/portal', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/portal/projects', label: 'My Projects', icon: FolderOpen },
  { path: '/portal/projects/new', label: 'New Project', icon: PlusCircle },
  { path: '/portal/history', label: 'Project History', icon: History },
  { path: '/portal/billing', label: 'Billing', icon: CreditCard },
  { path: '/portal/notifications', label: 'Notifications', icon: Bell },
  { path: '/portal/settings', label: 'Settings', icon: Settings },
]

export default function PortalLayout() {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-[#0f172a] text-white flex flex-col">
        <div className="p-4">
          <img src="/logo.svg" alt="First Front Solar Energy" className="w-full h-auto" />
          <p className="text-xs text-primary-200 mt-1 ml-1">Client Portal</p>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                location.pathname === item.path
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="text-sm text-slate-400 mb-2">{user?.company_name}</div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white">
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
