import { useEffect, useState } from 'react'
import { Target, Users, TrendingUp, Phone, ArrowRight, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import API from '../../utils/api'
import { LEAD_STATUS_MAP } from '../../utils/constants'

interface Lead {
  id: string; name: string; company: string; phone: string; email: string;
  requirement: string; status: string; lead_score: number; created_at: string;
}

const PIPELINE_ORDER = ['new', 'contacted', 'interested', 'followup', 'meeting_scheduled', 'quotation_sent']

export default function SalesDashboard() {
  const { user } = useAuthStore()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data } = await API.get('/leads/')
        setLeads(data)
      } catch { setLeads([]) }
      setLoading(false)
    }
    fetchLeads()
  }, [])

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
      <div className="space-y-6 animate-fade-in">
        <div className="skeleton h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-64 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Sales Pipeline</h1>
          <p className="page-subtitle">Welcome back, {firstName}. You have {totalActive} active leads.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Lead
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: leads.length, icon: Target, color: 'text-brand-500', bg: 'bg-brand-50' },
          { label: 'Active Pipeline', value: totalActive, icon: TrendingUp, color: 'text-sun-600', bg: 'bg-sun-50' },
          { label: 'Converted', value: converted, icon: Users, color: 'text-success', bg: 'bg-success-bg' },
          { label: 'Follow-ups Today', value: leads.filter(l => l.status === 'followup').length, icon: Phone, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold font-display text-ink animate-count-up">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pipeline Kanban */}
      <div>
        <h2 className="section-header mb-4">Lead Pipeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto">
          {pipeline.map(col => (
            <div key={col.status} className="min-w-[200px]">
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className={`status-pill ${col.meta.bgColor} ${col.meta.color}`}>
                  {col.meta.label}
                </span>
                <span className="text-xs text-gray-400 font-medium">{col.leads.length}</span>
              </div>
              <div className="space-y-2">
                {col.leads.map(lead => (
                  <Link
                    key={lead.id}
                    to={`/sales/leads/${lead.id}`}
                    className="card-hover p-3 block"
                  >
                    <p className="text-sm font-medium text-ink truncate">{lead.name}</p>
                    <p className="text-xs text-gray-500 truncate">{lead.company}</p>
                    {lead.requirement && (
                      <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{lead.requirement}</p>
                    )}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                      <span className="text-[10px] text-gray-400">Score: {lead.lead_score}</span>
                      <ArrowRight className="h-3 w-3 text-gray-300" />
                    </div>
                  </Link>
                ))}
                {col.leads.length === 0 && (
                  <div className="border-2 border-dashed border-gray-100 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-400">No leads</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Leads */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="section-header text-base">Recent Leads</h2>
          <span className="text-xs text-gray-400">{leads.length} total</span>
        </div>
        <div className="divide-y divide-gray-50">
          {leads.slice(0, 8).map(lead => {
            const status = LEAD_STATUS_MAP[lead.status] || { label: lead.status, color: 'text-gray-600', bgColor: 'bg-gray-100' }
            return (
              <Link key={lead.id} to={`/sales/leads/${lead.id}`}
                className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="avatar">{lead.name.split(' ').map(n => n[0]).join('').slice(0,2)}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{lead.name}</p>
                    <p className="text-xs text-gray-500">{lead.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`status-pill ${status.bgColor} ${status.color}`}>{status.label}</span>
                  <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
