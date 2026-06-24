import { useState, useEffect } from 'react'
import { PhoneCall, Mail, Video, Calendar, Clock, FileText } from 'lucide-react'
import API from '../../utils/api'

interface Activity {
  id: string; discussion_notes: string; next_action: string;
  lead_id: string; user_id: string; date: string;
  lead_name?: string; lead_company?: string;
}

const TYPE_META: Record<string, { icon: typeof PhoneCall; label: string; color: string; bg: string }> = {
  call:    { icon: PhoneCall, label: 'Call', color: 'text-brand-500', bg: 'bg-brand-50' },
  meeting: { icon: Video, label: 'Meeting', color: 'text-purple-500', bg: 'bg-purple-50' },
  email:   { icon: Mail, label: 'Email', color: 'text-sun-600', bg: 'bg-sun-50' },
  note:    { icon: FileText, label: 'Note', color: 'text-gray-500', bg: 'bg-gray-100' },
}

function detectType(notes: string): string {
  const lower = notes.toLowerCase()
  if (lower.includes('call') || lower.includes('spoke') || lower.includes('phone')) return 'call'
  if (lower.includes('meeting') || lower.includes('met') || lower.includes('discussed')) return 'meeting'
  if (lower.includes('email') || lower.includes('sent') || lower.includes('shared')) return 'email'
  return 'note'
}

export default function SalesActivityLog() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [leads, setLeads] = useState<Record<string, { name: string; company: string }>>({})
  const [selectedType, setSelectedType] = useState<string>('all')

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [actRes, leadsRes] = await Promise.all([
          API.get('/api/leads/activities'),
          API.get('/api/leads/')
        ])
        const actData = Array.isArray(actRes.data) ? actRes.data : []
        setActivities(actData)
        const leadMap: Record<string, { name: string; company: string }> = {}
        const leadsData = Array.isArray(leadsRes.data) ? leadsRes.data : []
        leadsData.forEach((l: any) => { leadMap[l.id] = { name: l.name, company: l.company } })
        setLeads(leadMap)
      } catch (error) {
        console.error('Failed to fetch activities')
      }
    }
    fetchAll()
  }, [])

  const enriched = activities.map(a => ({
    ...a,
    type: detectType(a.discussion_notes),
    lead_name: leads[a.lead_id]?.name || 'Unknown Lead',
    lead_company: leads[a.lead_id]?.company || '',
  }))

  const filtered = selectedType === 'all' ? enriched : enriched.filter(a => a.type === selectedType)
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Sales Activity</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <Calendar className="h-4 w-4" /> {today}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(TYPE_META).map(([key, meta]) => {
          const count = enriched.filter(a => a.type === key).length
          return (
            <div key={key} className="bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all"
              onClick={() => setSelectedType(selectedType === key ? 'all' : key)}>
              <div className={`w-9 h-9 rounded-lg ${meta.bg} ${meta.color} flex items-center justify-center mb-2`}>
                <meta.icon className="h-4 w-4" />
              </div>
              <p className="text-xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500">{meta.label}s</p>
            </div>
          )
        })}
      </div>

      {/* Filter */}
      <div className="flex gap-1.5">
        <button
          onClick={() => setSelectedType('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${selectedType === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >All</button>
        {Object.entries(TYPE_META).map(([key, meta]) => (
          <button key={key}
            onClick={() => setSelectedType(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${selectedType === key ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >{meta.label}s</button>
        ))}
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <FileText className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900">No activities yet</h3>
            <p className="text-sm text-gray-500 mt-1">Start logging your sales activities</p>
          </div>
        ) : (
          filtered.map((activity) => {
            const meta = TYPE_META[activity.type] || TYPE_META.note
            return (
              <div key={activity.id} className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${meta.bg} ${meta.color} flex items-center justify-center shrink-0`}>
                    <meta.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{activity.lead_name}</p>
                        <span className="text-xs text-gray-400">·</span>
                        <p className="text-xs text-gray-500">{activity.lead_company}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {activity.date ? new Date(activity.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{activity.discussion_notes}</p>
                    {activity.next_action && (
                      <div className="mt-2 px-3 py-1.5 bg-amber-50 rounded-lg inline-block">
                        <p className="text-xs text-amber-700 font-medium">Next: {activity.next_action}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
