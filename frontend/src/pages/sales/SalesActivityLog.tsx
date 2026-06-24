import { useState, useEffect } from 'react'
import { PhoneCall, MessageCircle, Mail, Video, Plus, Calendar, Clock } from 'lucide-react'
import API from '../../utils/api'

interface Activity {
  id: string; type: string; leadName: string; company: string;
  notes: string; nextAction: string; time: string;
}

const TYPE_META: Record<string, { icon: typeof PhoneCall; label: string; color: string; bg: string }> = {
  call:    { icon: PhoneCall, label: 'Call', color: 'text-brand-500', bg: 'bg-brand-50' },
  meeting: { icon: Video, label: 'Meeting', color: 'text-purple-500', bg: 'bg-purple-50' },
  email:   { icon: Mail, label: 'Email', color: 'text-sun-600', bg: 'bg-sun-50' },
  chat:    { icon: MessageCircle, label: 'Chat', color: 'text-green-500', bg: 'bg-green-50' },
}

export default function SalesActivityLog() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [selectedType, setSelectedType] = useState<string>('all')

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data } = await API.get('/api/leads/activities')
        setActivities(data)
      } catch (error) {
        console.error('Failed to fetch activities')
      }
    }
    fetchActivities()
  }, [])

  const filtered = selectedType === 'all' ? activities : activities.filter(a => a.type === selectedType)
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Sales Activity</h1>
          <p className="page-subtitle flex items-center gap-2">
            <Calendar className="h-4 w-4" /> {today}
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Log Activity
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(TYPE_META).map(([key, meta]) => {
          const count = activities.filter(a => a.type === key).length
          return (
            <div key={key} className="stat-card cursor-pointer hover:shadow-card-hover transition-all"
              onClick={() => setSelectedType(selectedType === key ? 'all' : key)}>
              <div className={`w-9 h-9 rounded-lg ${meta.bg} ${meta.color} flex items-center justify-center mb-2`}>
                <meta.icon className="h-4 w-4" />
              </div>
              <p className="text-xl font-bold font-display text-ink">{count}</p>
              <p className="text-xs text-gray-500">{meta.label}s today</p>
            </div>
          )
        })}
      </div>

      {/* Filter */}
      <div className="flex gap-1.5">
        <button
          onClick={() => setSelectedType('all')}
          className={selectedType === 'all' ? 'tab-active' : 'tab-inactive'}
        >All</button>
        {Object.entries(TYPE_META).map(([key, meta]) => (
          <button key={key}
            onClick={() => setSelectedType(key)}
            className={selectedType === key ? 'tab-active' : 'tab-inactive'}
          >{meta.label}s</button>
        ))}
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {filtered.map((activity, idx) => {
          const meta = TYPE_META[activity.type] || TYPE_META.call
          return (
            <div key={activity.id} className="card p-4 animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl ${meta.bg} ${meta.color} flex items-center justify-center shrink-0`}>
                  <meta.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-ink">{activity.leadName}</p>
                      <span className="text-xs text-gray-400">·</span>
                      <p className="text-xs text-gray-500">{activity.company}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {activity.time}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{activity.notes}</p>
                  {activity.nextAction && (
                    <div className="mt-2 px-3 py-1.5 bg-amber-50 rounded-lg inline-block">
                      <p className="text-xs text-amber-700 font-medium">Next: {activity.nextAction}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
