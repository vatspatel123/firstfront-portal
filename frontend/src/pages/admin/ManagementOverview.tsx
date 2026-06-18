import { useEffect } from 'react'
import { AlertTriangle, TrendingUp, Users, DollarSign } from 'lucide-react'
import { useProjectStore } from '../../store/useApiStores'

export default function ManagementOverview() {
  const { projects, loading, fetchProjects } = useProjectStore()

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const activeProjects = projects.filter(p => p.status !== 'delivered')
  const deliveredProjects = projects.filter(p => p.status === 'delivered')

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card p-5 animate-pulse">
            <div className="w-10 h-10 rounded-lg bg-gray-200 mb-3" />
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-1" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Management Overview</h1>
        <p className="text-gray-500 mt-1">High-level view of all operations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-brand-500" />
            </div>
          </div>
          <p className="text-2xl font-bold font-display text-ink">{activeProjects.length}</p>
          <p className="text-sm text-gray-500">Active Projects</p>
        </div>
        <div className="card p-5">
          <div className="w-10 h-10 rounded-lg bg-sun-100 flex items-center justify-center mb-3">
            <Users className="h-5 w-5 text-sun-700" />
          </div>
          <p className="text-2xl font-bold font-display text-ink">{projects.filter(p => p.status === 'new' || p.status === 'data_review').length}</p>
          <p className="text-sm text-gray-500">Needs Attention</p>
        </div>
        <div className="card p-5">
          <div className="w-10 h-10 rounded-lg bg-success-bg flex items-center justify-center mb-3">
            <DollarSign className="h-5 w-5 text-success" />
          </div>
          <p className="text-2xl font-bold font-display text-ink">{deliveredProjects.length}</p>
          <p className="text-sm text-gray-500">Delivered</p>
        </div>
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-display font-semibold text-ink flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Needs Attention
          </h2>
          <span className="text-xs text-gray-400">{projects.filter(p => p.status === 'new' || p.status === 'missing_data').length} items</span>
        </div>
        <div className="divide-y divide-gray-50">
          {projects.filter(p => p.status === 'new' || p.status === 'missing_data').length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">All projects are running smoothly.</div>
          ) : (
            projects.filter(p => p.status === 'new' || p.status === 'missing_data').map((p) => (
              <div key={p.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink text-sm">{p.name}</p>
                  <p className="text-sm text-gray-500 truncate">{p.project_type} · {p.location}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    p.status === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-warning-bg text-warning'
                  }`}>{p.status.replace('_', ' ')}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-display font-semibold text-ink">All Projects ({projects.length})</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {projects.map((p) => (
            <div key={p.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink text-sm">{p.name}</p>
                <p className="text-xs text-gray-400">{p.project_type} · {p.location}</p>
              </div>
              <span className="text-xs text-gray-400 shrink-0">{p.status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
