import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { LayoutDashboard, FolderOpen, MessageCircle, Settings, LogOut, Sun, Bell, PenTool, Wrench } from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { path: '/designer', label: 'My Day', icon: LayoutDashboard },
  { path: '/designer/projects', label: 'Projects', icon: FolderOpen },
  { path: '/designer/workspace', label: 'Workspace', icon: PenTool },
  { path: '/designer/messages', label: 'Messages', icon: MessageCircle },
  { path: '/designer/tools', label: 'Tools', icon: Wrench },
  { path: '/designer/notifications', label: 'Notifications', icon: Bell },
  { path: '/designer/settings', label: 'Settings', icon: Settings },
]

export default function DesignerLayout() {
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
            <p className="text-xs text-primary-200">Designer</p>
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
          <div className="text-sm text-primary-200 mb-2">{user?.name || 'Designer'}</div>
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
