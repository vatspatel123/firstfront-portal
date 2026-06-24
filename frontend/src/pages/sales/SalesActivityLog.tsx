import { useState, useEffect } from 'react'
import { PhoneCall, Mail, Video, Calendar, Clock, FileText, Plus, X } from 'lucide-react'
import API from '../../utils/api'
import toast from 'react-hot-toast'

interface Activity {
  id: string; discussion_notes: string; next_action: string;
  lead_id: string; user_id: string; date: string;
  lead_name?: string; lead_company?: string;
}

interface Lead {
  id: string; name: string; company: string;
}

const TYPE_META: Record<string, { icon: typeof PhoneCall; label: string; color: string; bg: string }> = {
  call:    { icon: PhoneCall, label: 'Call', color: 'text-primary-600', bg: 'bg-primary-50' },
  meeting: { icon: Video, label: 'Meeting', color: 'text-purple-600', bg: 'bg-purple-50' },
  email:   { icon: Mail, label: 'Email', color: 'text-amber-600', bg: 'bg-amber-50' },
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
  const [leads, setLeads] = useState<Lead[]>([])
  const [leadMap, setLeadMap] = useState<Record<string, { name: string; company: string }>>({})
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showLogActivity, setShowLogActivity] = useState(false)
  const [form, setForm] = useState({ lead_id: '', discussion_notes: '', next_action: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [actRes, leadsRes] = await Promise.all([
        API.get('/api/leads/activities'),
        API.get('/api/leads/')
      ])
      setActivities(Array.isArray(actRes.data) ? actRes.data : [])
      const leadsData: Lead[] = Array.isArray(leadsRes.data) ? leadsRes.data : []
      setLeads(leadsData)
      const map: Record<string, { name: string; company: string }> = {}
      leadsData.forEach(l => { map[l.id] = { name: l.name, company: l.company } })
      setLeadMap(map)
    } catch {
      console.error('Failed to fetch activities')
    }
  }

  const handleLogActivity = async () => {
    if (!form.discussion_notes.trim()) {
      toast.error('Discussion notes are required')
      return
    }
    setSaving(true)
    try {
      await API.post('/api/leads/activities', {
        lead_id: form.lead_id || null,
        discussion_notes: form.discussion_notes,
        next_action: form.next_action || null,
      })
      toast.success('Activity logged')
      setShowLogActivity(false)
      setForm({ lead_id: '', discussion_notes: '', next_action: '' })
      fetchAll()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to log activity')
    } finally {
      setSaving(false)
    }
  }

  const enriched = activities.map(a => ({
    ...a,
    type: detectType(a.discussion_notes),
    lead_name: leadMap[a.lead_id]?.name || 'General',
    lead_company: leadMap[a.lead_id]?.company || '',
  }))

  const filtered = selectedType === 'all' ? enriched : enriched.filter(a => a.type === selectedType)
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Activity</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <Calendar className="h-4 w-4" /> {today}
          </p>
        </div>
        <button onClick={() => setShowLogActivity(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2">
          <Plus className="h-4 w-4" /> Log Activity
        </button>
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
        <button onClick={() => setSelectedType('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${selectedType === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          All
        </button>
        {Object.entries(TYPE_META).map(([key, meta]) => (
          <button key={key} onClick={() => setSelectedType(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${selectedType === key ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {meta.label}s
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <FileText className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900">No activities yet</h3>
            <p className="text-sm text-gray-500 mt-1">Start logging your sales activities</p>
            <button onClick={() => setShowLogActivity(true)}
              className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm">
              Log Your First Activity
            </button>
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
                        {activity.lead_company && (
                          <>
                            <span className="text-xs text-gray-400">·</span>
                            <p className="text-xs text-gray-500">{activity.lead_company}</p>
                          </>
                        )}
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

      {/* Log Activity Modal */}
      {showLogActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowLogActivity(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Log Activity</h2>
              <button onClick={() => setShowLogActivity(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Related Lead</label>
                <select value={form.lead_id} onChange={e => setForm(f => ({ ...f, lead_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option value="">General (no specific lead)</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>{l.name} — {l.company}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discussion Notes *</label>
                <textarea value={form.discussion_notes} onChange={e => setForm(f => ({ ...f, discussion_notes: e.target.value }))}
                  placeholder="What was discussed? (e.g. Called client, discussed rooftop feasibility...)"
                  rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Action</label>
                <input type="text" value={form.next_action} onChange={e => setForm(f => ({ ...f, next_action: e.target.value }))}
                  placeholder="Follow-up plan..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowLogActivity(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleLogActivity} disabled={saving}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">
                {saving ? 'Saving...' : 'Log Activity'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
