import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, Building2, Calendar, MessageCircle, FileText, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import API from '../../utils/api'
import { LEAD_STATUS_MAP } from '../../utils/constants'

interface Lead {
  id: string; name: string; company: string; phone: string; email: string;
  requirement: string; status: string; lead_score: number; created_at: string;
}

interface FollowUp {
  id: string; note: string; status: string; created_at: string;
  next_followup_date?: string; meeting_schedule?: string;
}

export default function LeadDetail() {
  const { id } = useParams()
  const [lead, setLead] = useState<Lead | null>(null)
  const [followups, setFollowups] = useState<FollowUp[]>([])
  const [loading, setLoading] = useState(true)
  const [newNote, setNewNote] = useState('')

  const fetchLeadData = async () => {
    try {
      const { data } = await API.get(`/api/leads/${id}`)
      setLead(data)
      try {
        const { data: fups } = await API.get(`/api/leads/${id}/followups`)
        setFollowups(fups)
      } catch { /* followups endpoint may not exist yet */ }
    } catch { /* handle error */ }
    setLoading(false)
  }

  useEffect(() => {
    if (id) fetchLeadData()
  }, [id])

  const handleStatusUpdate = async (newStatus: string) => {
    if (!lead || !id) return
    try {
      await API.patch(`/api/leads/${id}/status`, { status: newStatus })
      setLead({ ...lead, status: newStatus })
      toast.success('Status updated')
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleSaveNote = async () => {
    if (!newNote.trim() || !id) return
    try {
      await API.post('/api/leads/followups', {
        lead_id: id,
        note: newNote,
        status: 'completed'
      })
      toast.success('Note added')
      setNewNote('')
      // Refresh followups
      const { data: fups } = await API.get(`/api/leads/${id}/followups`)
      setFollowups(fups)
    } catch (error) {
      toast.error('Failed to add note')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center p-12 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-slate-300" />
        </div>
        <p className="text-slate-500">Lead not found</p>
        <Link to="/sales" className="mt-4 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium">Back to Pipeline</Link>
      </div>
    )
  }

  const status = LEAD_STATUS_MAP[lead.status] || { label: lead.status, color: 'text-slate-600', bgColor: 'bg-slate-100' }
  const statusKeys = Object.keys(LEAD_STATUS_MAP).filter(s => s !== 'converted' && s !== 'lost')

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/sales" className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-900">{lead.name}</h1>
          <p className="text-sm text-slate-500">{lead.company}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>{status.label}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Phone</p>
                  <p className="text-sm font-medium text-slate-900">{lead.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="text-sm font-medium text-slate-900">{lead.email || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Company</p>
                  <p className="text-sm font-medium text-slate-900">{lead.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Lead Score</p>
                  <p className="text-sm font-bold text-slate-900">{lead.lead_score}/100</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Change */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Update Status</h3>
            <div className="flex flex-wrap gap-1.5">
              {statusKeys.map(s => {
                const meta = LEAD_STATUS_MAP[s]
                const isActive = lead.status === s
                return (
                  <button key={s}
                    onClick={() => handleStatusUpdate(s)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all duration-200 ${
                      isActive ? `${meta.bgColor} ${meta.color} ring-1 ring-current/20` : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                    }`}
                  >{meta.label}</button>
                )
              })}
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => handleStatusUpdate('converted')} className="flex-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-all duration-200">Mark Converted</button>
              <button onClick={() => handleStatusUpdate('lost')} className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-all duration-200">Mark Lost</button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Requirement */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Requirement</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{lead.requirement || 'No requirement specified'}</p>
          </div>

          {/* Follow-ups / Notes */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Follow-ups & Notes</h3>
              <span className="text-xs text-slate-400">{followups.length} entries</span>
            </div>

            {/* Add Note */}
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/30">
              <textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Add a follow-up note..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm resize-none"
                rows={2}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-2">
                  <button className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-all">
                    <Calendar className="h-3.5 w-3.5" /> Schedule Follow-up
                  </button>
                  <button className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-all">
                    <MessageCircle className="h-3.5 w-3.5" /> Schedule Meeting
                  </button>
                </div>
                <button onClick={handleSaveNote} className="bg-blue-600 text-white text-xs px-4 py-1.5 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium" disabled={!newNote.trim()}>Save Note</button>
              </div>
            </div>

            {/* Timeline */}
            <div className="px-5 py-4">
              {followups.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No follow-ups yet. Add your first note above.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {followups.map(fup => (
                    <div key={fup.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                        <div className="w-0.5 flex-1 bg-slate-100" />
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm text-slate-900">{fup.note}</p>
                        <p className="text-xs text-slate-400 mt-1">{new Date(fup.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
