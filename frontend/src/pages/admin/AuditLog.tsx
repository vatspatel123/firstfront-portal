import { useEffect, useState } from 'react'
import { Shield, User, FolderOpen, Users, ClipboardList, Clock } from 'lucide-react'
import API from '../../utils/api'

interface AuditEntry {
  id: string
  user_name: string
  user_role: string
  action: string
  entity_type: string
  entity_id: string | null
  entity_name: string | null
  details: string | null
  created_at: string
}

const entityIcons: Record<string, any> = {
  project: ClipboardList,
  lead: Users,
  employee: User,
  client: FolderOpen,
}

const entityColors: Record<string, string> = {
  project: 'bg-blue-50 text-blue-600',
  lead: 'bg-amber-50 text-amber-600',
  employee: 'bg-green-50 text-green-600',
  client: 'bg-purple-50 text-purple-600',
}

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await API.get('/api/audit/')
        setLogs(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        console.error('Failed to load audit logs', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [])

  const filtered = filter === 'all' ? logs : logs.filter(l => l.entity_type === filter)

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Audit Log</h1>
        <p className="text-sm text-slate-500 mt-1">Track all changes across projects, leads, and employees</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'project', 'lead', 'employee'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === f ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
            {f === 'all' ? 'All Activity' : f.charAt(0).toUpperCase() + f.slice(1) + 's'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <Shield className="h-12 w-12 text-slate-200 mx-auto mb-3" />
          <h3 className="font-medium text-slate-900">No activity yet</h3>
          <p className="text-sm text-slate-500 mt-1">Actions will appear here as they happen</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          {filtered.map(log => {
            const Icon = entityIcons[log.entity_type] || Shield
            const colorClass = entityColors[log.entity_type] || 'bg-slate-50 text-slate-600'
            return (
              <div key={log.id} className="px-5 py-4 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900">
                    <span className="font-medium">{log.user_name}</span>
                    <span className="text-slate-400 mx-1">·</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{log.user_role}</span>
                  </p>
                  <p className="text-sm text-slate-700 mt-0.5">{log.action}</p>
                  {log.entity_name && (
                    <p className="text-xs text-slate-400 mt-1">
                      {log.entity_type}: {log.entity_name}
                    </p>
                  )}
                  {log.details && (
                    <p className="text-xs text-slate-400 mt-0.5">{log.details}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0 mt-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(log.created_at)}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
