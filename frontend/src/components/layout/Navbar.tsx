import { useState, useRef, useEffect } from 'react'
import { Bell, Sun, LogOut, Menu, Settings, ChevronDown } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useNotificationStore } from '../../store/useApiStores'
import { USER_ROLES } from '../../utils/constants'

export default function Navbar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { notifications: notifs, unreadCount, fetchNotifications, fetchUnreadCount, markAllRead } = useNotificationStore()
  const [showNotif, setShowNotif] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const displayName = user?.name || 'User'
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const roleMeta = user?.role ? USER_ROLES[user.role] : null

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  useEffect(() => { fetchNotifications(); fetchUnreadCount() }, [fetchNotifications, fetchUnreadCount])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100/80">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button onClick={onMenuToggle} className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 transition-colors">
              <Menu className="h-5 w-5" />
            </button>
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-sun-400 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Sun className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-display font-semibold text-lg bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent">
                First Front
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotif(!showNotif)}
                className="relative p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-200"
              >
                <Bell className="h-[18px] w-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-error text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-scale-in shadow-sm">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotif && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-modal border border-gray-100/80 overflow-hidden animate-scale-in">
                  <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                    <p className="font-display font-semibold text-sm text-ink">Notifications</p>
                    {unreadCount > 0 && (
                      <button onClick={() => markAllRead()} className="text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifs.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No notifications yet</p>
                      </div>
                    ) : (
                      notifs.slice(0, 5).map((n) => (
                        <div key={n.id} className={`px-4 py-3 border-b border-gray-50/80 hover:bg-gray-50/50 transition-colors ${!n.is_read ? 'bg-brand-50/20' : ''}`}>
                          <p className="text-sm text-ink leading-snug">{n.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                  {notifs.length > 0 && (
                    <Link
                      to="/notifications"
                      onClick={() => setShowNotif(false)}
                      className="block px-4 py-2.5 text-center text-xs font-medium text-brand-500 hover:bg-brand-50/50 transition-colors border-t border-gray-50"
                    >
                      View all notifications
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-ink leading-tight">{displayName}</p>
                  {roleMeta && (
                    <p className={`text-[10px] font-medium ${roleMeta.color}`}>{roleMeta.label}</p>
                  )}
                </div>
                <ChevronDown className={`h-3.5 w-3.5 text-gray-400 hidden sm:block transition-transform duration-200 ${showProfile ? 'rotate-180' : ''}`} />
              </button>
              {showProfile && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-modal border border-gray-100/80 overflow-hidden animate-scale-in">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="font-medium text-sm text-ink">{displayName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{user?.company_name || user?.role}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/settings"
                      onClick={() => setShowProfile(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="h-4 w-4" /> Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
