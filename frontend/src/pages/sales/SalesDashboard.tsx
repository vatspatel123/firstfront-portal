import { useEffect, useState } from 'react'
import { Target, Users, TrendingUp, Phone, ArrowRight, Plus, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import API from '../../utils/api'
import { LEAD_STATUS_MAP } from '../../utils/constants'
import toast from 'react-hot-toast'

interface Lead {
  id: string; name: string; company: string; phone: string; email: string;
  requirement: string; status: string; lead_score: number; created_at: string;
}

const PIPELINE_ORDER = ['new', 'contacted', 'interested', 'followup', 'meeting_scheduled', 'quotation_sent']

export default function SalesDashboard() {
  const { user } = useAuthStore()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewLead, setShowNewLead] = useState(false)
  const [form, setForm] = useState({ name: '', company: '', phone: '', email: '', requirement: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const { data } = await API.get('/api/leads/')
      setLeads(data)
    } catch { setLeads([]) }
    setLoading(false)
  }

  const handleCreateLead = async () => {
    if (!form.name.trim() || !form.company.trim() || !form.phone.trim()) {
      toast.error('Name, company and phone are required')
      return
    }
    setSaving(true)
    try {
      await API.post('/api/leads/', form)
      toast.success('Lead created successfully')
      setShowNewLead(false)
      setForm({ name: '', company: '', phone: '', email: '', requirement: '' })
      fetchLeads()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to create lead')
    } finally {
      setSaving(false)
    }
  }

  const firstName = user?.name?.split(' ')[0] || 'there'
  const pipeline = PIPELINE_ORDER.map(status => ({
    status,
    meta: LEAD_STATUS_MAP[status],
    leads: leads.filter(l => l.status === status),
  }))
  const converted = leads.filter(l => l.status === 'converted').length
  const totalActive = leads.filter(l => l.status !== 'converted' && l.status !== 'lost').length

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-100 rounded-xl w-64" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Sales Pipeline</h1>
          <p className="text-slate-500 mt-1">Welcome back, {firstName}. You have {totalActive} active leads.</p>
        </div>
        <button onClick={() => setShowNewLead(true)} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Lead
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: leads.length, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Pipeline', value: totalActive, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Converted', value: converted, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Follow-ups Today', value: leads.filter(l => l.status === 'followup').length, icon: Phone, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-semibold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pipeline Kanban */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Lead Pipeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto">
          {pipeline.map(col => (
            <div key={col.status} className="min-w-[200px]">
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${col.meta?.bgColor || 'bg-slate-100'} ${col.meta?.color || 'text-slate-600'}`}>
                  {col.meta?.label || col.status}
                </span>
                <span className="text-xs text-slate-400 font-medium">{col.leads.length}</span>
              </div>
              <div className="space-y-2">
                {col.leads.map(lead => (
                  <Link key={lead.id} to={`/sales/leads/${lead.id}`}
                    className="bg-white rounded-2xl border border-slate-200 p-3 block hover:shadow-md transition-all duration-200">
                    <p className="text-sm font-medium text-slate-900 truncate">{lead.name}</p>
                    <p className="text-xs text-slate-500 truncate">{lead.company}</p>
                    {lead.requirement && (
                      <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{lead.requirement}</p>
                    )}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400">Score: {lead.lead_score}</span>
                      <ArrowRight className="h-3 w-3 text-slate-300" />
                    </div>
                  </Link>
                ))}
                {col.leads.length === 0 && (
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center">
                    <p className="text-xs text-slate-400">No leads</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent Leads</h2>
          <span className="text-xs text-slate-400">{leads.length} total</span>
        </div>
        <div className="divide-y divide-slate-100">
          {leads.slice(0, 8).map(lead => {
            const status = LEAD_STATUS_MAP[lead.status] || { label: lead.status, color: 'text-slate-600', bgColor: 'bg-slate-100' }
            return (
              <Link key={lead.id} to={`/sales/leads/${lead.id}`}
                className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-all group">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {lead.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{lead.name}</p>
                    <p className="text-xs text-slate-500">{lead.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>{status.label}</span>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
              </Link>
            )
          })}
          {leads.length === 0 && (
            <div className="p-8 text-center text-slate-500">No leads yet. Create your first lead!</div>
          )}
        </div>
      </div>

      {/* New Lead Modal */}
      {showNewLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowNewLead(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">New Lead</h2>
              <button onClick={() => setShowNewLead(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Name *</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Full name" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company *</label>
                <input type="text" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                  placeholder="Company name" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 XXXXX XXXXX" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="email@company.com" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Requirement</label>
                <textarea value={form.requirement} onChange={e => setForm(f => ({ ...f, requirement: e.target.value }))}
                  placeholder="Brief description of what the lead needs..."
                  rows={3} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowNewLead(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-all">
                Cancel
              </button>
              <button onClick={handleCreateLead} disabled={saving}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 font-medium">
                {saving ? 'Creating...' : 'Create Lead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
