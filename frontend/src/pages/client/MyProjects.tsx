import { useEffect, useState } from 'react'
import { Search, ArrowRight, Clock, CheckCircle, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useProjectStore, type Project } from '../../store/useApiStores'

const STATUS_FLOW: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700' },
  data_review: { label: 'Data Review', color: 'bg-purple-100 text-purple-700' },
  missing_data: { label: 'Missing Data', color: 'bg-warning-bg text-warning' },
  data_complete: { label: 'Data Complete', color: 'bg-brand-50 text-brand-600' },
  assigned: { label: 'Assigned', color: 'bg-sun-100 text-sun-700' },
  design_in_progress: { label: 'In Design', color: 'bg-sun-100 text-sun-700' },
  ready: { label: 'Ready', color: 'bg-success-bg text-success' },
  delivered: { label: 'Delivered', color: 'bg-success-bg text-success' },
}

export default function MyProjects() {
  const [search, setSearch] = useState('')
  const { projects, loading, fetchProjects } = useProjectStore()

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = filtered.reduce((acc, p) => {
    const key = p.status === 'delivered' ? 'delivered' : 'active'
    if (!acc[key]) acc[key] = []
    acc[key].push(p)
    return acc
  }, {} as Record<string, Project[]>)

  if (loading) return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card p-5 animate-pulse">
          <div className="flex justify-between mb-3">
            <div className="space-y-2"><div className="h-4 bg-gray-200 rounded w-48" /><div className="h-3 bg-gray-100 rounded w-32" /></div>
            <div className="h-6 bg-gray-100 rounded-full w-20" />
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full w-full" />
        </div>
      ))}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">My Projects</h1>
        <p className="text-gray-500 mt-1">Track the progress of your solar design projects.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by project name or location..." className="input-field pl-10" />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="h-12 w-12 text-gray-200 mx-auto mb-3" />
          <h3 className="font-display font-medium text-ink">No projects found</h3>
          <p className="text-sm text-gray-500 mt-1">Start your first solar design project to see it here.</p>
        </div>
      ) : (
        <>
          {grouped.active && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-brand-500" />
                <h2 className="font-display font-semibold text-ink">Active ({grouped.active.length})</h2>
              </div>
              <div className="space-y-3">
                {grouped.active.map((p) => {
                  const status = STATUS_FLOW[p.status] || { label: p.status, color: 'bg-gray-100 text-gray-600' }
                  return (
                    <Link key={p.id} to={`/portal/projects/${p.id}`} className="card-hover p-5 block">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-display font-medium text-ink">{p.name}</p>
                          <p className="text-sm text-gray-500">{p.services_required} · {p.location}</p>
                        </div>
                        <span className={`status-pill ${status.color}`}>{status.label}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{p.capacity} kW</span>
                        <span>Created {p.created_at?.slice(0,10)}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {grouped.delivered && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-4 w-4 text-success" />
                <h2 className="font-display font-semibold text-ink">Delivered ({grouped.delivered.length})</h2>
              </div>
              <div className="space-y-3">
                {grouped.delivered.map((p) => {
                  const status = STATUS_FLOW[p.status] || { label: p.status, color: 'bg-gray-100 text-gray-600' }
                  return (
                    <div key={p.id} className="card-hover p-5 opacity-80">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-display font-medium text-ink">{p.name}</p>
                          <p className="text-sm text-gray-500">{p.services_required} · {p.location}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`status-pill ${status.color}`}>{status.label}</span>
                          <ArrowRight className="h-4 w-4 text-gray-300" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
