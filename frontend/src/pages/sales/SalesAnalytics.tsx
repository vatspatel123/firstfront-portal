import { useEffect, useState } from 'react'
import { TrendingUp, Users, Target, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import API from '../../utils/api'
import { LEAD_STATUS_MAP } from '../../utils/constants'

interface Lead {
  id: string; status: string; lead_score: number; created_at: string;
}

export default function SalesAnalytics() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/api/leads/')
        setLeads(data)
      } catch { setLeads([]) }
      setLoading(false)
    }
    fetch()
  }, [])

  const total = leads.length
  const converted = leads.filter(l => l.status === 'converted').length
  const lost = leads.filter(l => l.status === 'lost').length
  const active = total - converted - lost
  const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0

  // Status distribution
  const statusCounts = Object.keys(LEAD_STATUS_MAP).map(status => ({
    status,
    meta: LEAD_STATUS_MAP[status],
    count: leads.filter(l => l.status === status).length,
    pct: total > 0 ? Math.round((leads.filter(l => l.status === status).length / total) * 100) : 0,
  }))

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-10 w-48 bg-slate-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Sales Analytics</h1>
        <p className="text-sm text-slate-500">Performance metrics and conversion insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: total, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%', up: true },
          { label: 'Active Pipeline', value: active, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', trend: '+8%', up: true },
          { label: 'Converted', value: converted, icon: Users, color: 'text-green-600', bg: 'bg-green-50', trend: `${conversionRate}%`, up: true },
          { label: 'Lost', value: lost, icon: BarChart3, color: 'text-red-600', bg: 'bg-red-50', trend: lost > 0 ? '-' : '0', up: false },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div className={`flex items-center gap-0.5 text-xs font-medium ${s.up ? 'text-green-600' : 'text-red-600'}`}>
                {s.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {s.trend}
              </div>
            </div>
            <p className="text-2xl font-semibold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Conversion Funnel</h2>
        <div className="space-y-3">
          {statusCounts.filter(s => s.count > 0).map((s, idx) => (
            <div key={s.status} className="flex items-center gap-4 animate-slide-up" style={{ animationDelay: `${idx * 80}ms` }}>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${s.meta.bgColor} ${s.meta.color} w-36 justify-center`}>
                {s.meta.label}
              </span>
              <div className="flex-1 h-8 bg-slate-50 rounded-xl overflow-hidden relative">
                <div
                  className={`h-full rounded-xl ${s.meta.bgColor} transition-all duration-700 ease-out flex items-center justify-end pr-3`}
                  style={{ width: `${Math.max(s.pct, 5)}%` }}
                >
                  <span className={`text-xs font-bold ${s.meta.color}`}>{s.count}</span>
                </div>
              </div>
              <span className="text-sm font-medium text-slate-500 w-12 text-right">{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Score Distribution */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Conversion Rate</h3>
          <div className="flex items-center justify-center py-8">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                <circle cx="60" cy="60" r="52" fill="none" stroke="#16A34A" strokeWidth="12"
                  strokeDasharray={`${conversionRate * 3.27} 327`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-slate-900">{conversionRate}%</span>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-slate-500">of leads converted to clients</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Lead Quality</h3>
          <div className="space-y-4 py-4">
            {[
              { label: 'High (70+)', count: leads.filter(l => l.lead_score >= 70).length, color: 'bg-green-500' },
              { label: 'Medium (40-69)', count: leads.filter(l => l.lead_score >= 40 && l.lead_score < 70).length, color: 'bg-amber-400' },
              { label: 'Low (<40)', count: leads.filter(l => l.lead_score < 40).length, color: 'bg-slate-300' },
            ].map(q => (
              <div key={q.label} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${q.color}`} />
                <span className="text-sm text-slate-600 flex-1">{q.label}</span>
                <span className="text-sm font-bold text-slate-900">{q.count}</span>
                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${q.color} transition-all duration-700`}
                    style={{ width: `${total > 0 ? (q.count / total) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
