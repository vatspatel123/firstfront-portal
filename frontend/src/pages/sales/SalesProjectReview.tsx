import { useEffect, useState } from 'react'
import { Search, ClipboardCheck, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import API from '../../utils/api'

interface Project {
  id: string
  name: string
  location: string
  capacity: string
  project_type: string
  services_required: string
  status: string
  client_name: string
  designer_name: string | null
  created_at: string
  priority: string
}

export default function SalesProjectReview() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await API.get('/api/projects/')
        const data = Array.isArray(res.data) ? res.data : []
        setProjects(data.filter((p: Project) => ['new', 'data_review', 'missing_data', 'data_complete'].includes(p.status)))
      } catch {
        console.error('Failed to load projects')
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  const handleAdvance = async (projectId: string, nextStatus: string) => {
    try {
      await API.patch(`/api/projects/${projectId}/status`, { status: nextStatus })
      toast.success('Project advanced')
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: nextStatus } : p))
    } catch {
      toast.error('Failed to advance project')
    }
  }

  const getMissingFields = (p: Project) => {
    const missing = []
    if (!p.location) missing.push('Location')
    if (!p.capacity) missing.push('Capacity')
    if (!p.services_required) missing.push('Services')
    if (!p.project_type) missing.push('Type')
    return missing
  }

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.client_name && p.client_name.toLowerCase().includes(search.toLowerCase()))
  )

  const nextAction: Record<string, { status: string; label: string }> = {
    new: { status: 'data_review', label: 'Review Data' },
    data_review: { status: 'missing_data', label: 'Mark Missing Data' },
    missing_data: { status: 'data_complete', label: 'Mark Complete' },
    data_complete: { status: 'assigned', label: 'Assign Designer' },
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
        <h1 className="text-2xl font-semibold text-slate-900">Project Review Queue</h1>
        <p className="text-sm text-slate-500 mt-1">Review client projects, validate data, and advance to assignment</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <p className="text-2xl font-bold text-blue-600">{projects.filter(p => p.status === 'new').length}</p>
          <p className="text-sm text-slate-500">Pending Review</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <p className="text-2xl font-bold text-amber-600">{projects.filter(p => ['data_review', 'missing_data'].includes(p.status)).length}</p>
          <p className="text-sm text-slate-500">In Review</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <p className="text-2xl font-bold text-green-600">{projects.filter(p => p.status === 'data_complete').length}</p>
          <p className="text-sm text-slate-500">Ready to Assign</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search projects..." className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <ClipboardCheck className="h-12 w-12 text-slate-200 mx-auto mb-3" />
          <h3 className="font-medium text-slate-900">All caught up!</h3>
          <p className="text-sm text-slate-500 mt-1">No projects pending review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(p => {
            const missing = getMissingFields(p)
            const action = nextAction[p.status]
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-slate-900">{p.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-600">
                        {p.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{p.client_name || 'Client'} · {p.services_required} · {p.capacity} kW</p>

                    {missing.length > 0 && p.status !== 'data_complete' && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600">
                        <AlertTriangle className="h-3 w-3" />
                        Missing: {missing.join(', ')}
                      </div>
                    )}
                    {missing.length === 0 && p.status === 'data_complete' && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                        All data complete — ready for assignment
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {action && (
                      <button onClick={() => handleAdvance(p.id, action.status)}
                        className="bg-blue-600 text-white text-sm py-2 px-4 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium flex items-center gap-1">
                        {action.label}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {p.status === 'data_complete' && (
                      <button onClick={() => navigate('/admin/assign')}
                        className="bg-green-600 text-white text-sm py-2 px-4 rounded-xl hover:bg-green-700 transition-all duration-200 font-medium flex items-center gap-1">
                        Assign
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
