import { useEffect, useState } from 'react'
import { Activity, Upload, MessageCircle, Sun, Camera, CheckCircle, Download } from 'lucide-react'
import api from '../../services/api'

interface ActivityItem {
  id: string
  type: string
  user: string
  action: string
  target: string
  project: string
  time: string
}

const iconMap: Record<string, any> = {
  upload: Upload,
  message: MessageCircle,
  status: Sun,
  file: Camera,
  complete: CheckCircle,
  download: Download,
}

const colorMap: Record<string, string> = {
  upload: 'bg-blue-100 text-blue-600',
  message: 'bg-amber-100 text-amber-600',
  status: 'bg-purple-100 text-purple-600',
  file: 'bg-blue-100 text-blue-600',
  complete: 'bg-green-100 text-green-600',
  download: 'bg-gray-100 text-gray-600',
}

export default function ActivityLog() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await api.get('/leads/activities')
        const items = res.data.map((a: any) => ({
          id: a.id,
          type: 'message',
          user: a.user_id,
          action: 'discussed',
          target: a.discussion_notes.substring(0, 50),
          project: '',
          time: new Date(a.date).toLocaleDateString()
        }))
        setActivities(items)
      } catch (err) {
        console.error('Failed to load activities', err)
      } finally {
        setLoading(false)
      }
    }
    fetchActivities()
  }, [])

  const filters = ['All', 'Uploads', 'Status', 'Messages', 'Completions']

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Activity Log</h1>
        <p className="text-gray-500 mt-1">A complete history of all platform activity</p>
      </div>

      <div className="flex gap-1 border-b border-gray-100 overflow-x-auto">
        {filters.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              filter === tab ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {activities.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No activity recorded yet</p>
          </div>
        ) : (
          activities.map((a) => {
            const Icon = iconMap[a.type] || Activity
            const color = colorMap[a.type] || 'bg-gray-100 text-gray-600'
            return (
              <div key={a.id} className="bg-white rounded-xl border p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{a.user}</span> {a.action} <span className="font-medium">{a.target}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.project} · {a.time}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
