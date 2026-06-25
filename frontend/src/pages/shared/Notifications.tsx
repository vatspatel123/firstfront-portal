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
      <div className="h-8 bg-slate-200 rounded w-48 animate-pulse" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-start gap-4 animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-slate-200" />
          <div className="flex-1 space-y-2"><div className="h-4 bg-slate-200 rounded w-3/4" /><div className="h-3 bg-slate-100 rounded w-1/4" /></div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1.5 font-medium">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <Bell className="h-12 w-12 text-slate-200 mx-auto mb-3" />
          <h3 className="font-medium text-slate-900">All caught up!</h3>
          <p className="text-sm text-slate-500 mt-1">You'll see updates about your projects here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-start gap-4 transition-all duration-200 hover:bg-slate-50 ${!n.is_read ? 'bg-blue-50/50 border-blue-200' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                n.type === 'success' ? 'bg-green-50' :
                n.type === 'warning' ? 'bg-amber-50' : 'bg-blue-50'
              }`}>
                <Bell className={`h-5 w-5 ${
                  n.type === 'success' ? 'text-green-600' :
                  n.type === 'warning' ? 'text-amber-600' : 'text-blue-600'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.is_read ? 'font-medium text-slate-900' : 'text-slate-600'}`}>{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
              </div>
              {!n.is_read && <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2" />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
