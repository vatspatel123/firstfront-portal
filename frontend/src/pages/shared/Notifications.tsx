import { useEffect } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNotificationStore } from '../../store/useApiStores'

export default function Notifications() {
  const { notifications, unreadCount, loading, fetchNotifications, markAllRead } = useNotificationStore()

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  const handleMarkAllRead = () => { markAllRead(); toast.success('All notifications marked as read') }

  if (loading) return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card p-4 flex items-start gap-4 animate-pulse">
          <div className="w-10 h-10 rounded-lg bg-gray-200" />
          <div className="flex-1 space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-100 rounded w-1/4" /></div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Notifications</h1>
          <p className="text-gray-500 text-sm mt-1">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-ghost text-sm flex items-center gap-1.5">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card p-12 text-center">
          <Bell className="h-12 w-12 text-gray-200 mx-auto mb-3" />
          <h3 className="font-display font-medium text-ink">All caught up!</h3>
          <p className="text-sm text-gray-500 mt-1">You'll see updates about your projects here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className={`card p-4 flex items-start gap-4 transition-colors ${!n.is_read ? 'bg-brand-50/30 border-brand-500/10' : ''}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                n.type === 'success' ? 'bg-success-bg' :
                n.type === 'warning' ? 'bg-warning-bg' : 'bg-brand-50'
              }`}>
                <Bell className={`h-5 w-5 ${
                  n.type === 'success' ? 'text-success' :
                  n.type === 'warning' ? 'text-warning' : 'text-brand-500'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.is_read ? 'font-medium text-ink' : 'text-gray-600'}`}>{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
              </div>
              {!n.is_read && <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-2" />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
