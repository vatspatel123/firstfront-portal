import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { LogOut, Menu, X } from 'lucide-react'
import { clsx } from 'clsx'
import type { ElementType } from 'react'

interface NavItem {
  path: string
  label: string
  icon: ElementType
}

interface SidebarLayoutProps {
  navItems: NavItem[]
  roleLabel: string
}

export default function SidebarLayout({ navItems, roleLabel }: SidebarLayoutProps) {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  useEffect(() => { setOpen(false) }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const Sidebar = () => (
    <aside className="w-64 bg-[#0f172a] text-white flex flex-col h-full">
      <div className="p-4 flex items-center justify-between">
        <img src="/logo.svg" alt="First Front Solar Energy" className="w-full h-auto" />
        <button onClick={() => setOpen(false)} className="lg:hidden text-white ml-2">
          <X className="h-5 w-5" />
        </button>
      </div>
      <p className="text-xs text-slate-400 px-5 -mt-2">{roleLabel}</p>
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4">
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
        <div className="text-sm text-slate-400 mb-2">{user?.name || user?.email || roleLabel}</div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:block h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative z-50 w-64 h-full">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center gap-3">
          <button onClick={() => setOpen(true)} className="p-1 text-gray-600 hover:text-gray-900">
            <Menu className="h-6 w-6" />
          </button>
          <img src="/logo.svg" alt="First Front" className="h-8" />
        </div>
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
