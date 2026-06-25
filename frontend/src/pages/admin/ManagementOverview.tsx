import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, TrendingUp, Users, Briefcase, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import API from '../../utils/api'

interface DashboardStats {
  total_leads: number
  total_projects: number
  active_projects: number
  new_projects: number
  delivered_projects: number
  pending_followups: number
  team_size: number
  designer_count: number
}

export default function ManagementOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, projectsRes] = await Promise.all([
          API.get('/api/dashboard/admin'),
          API.get('/api/projects/')
        ])
        setStats(statsRes.data)
        setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : [])
      } catch (err) {
        console.error('Failed to load dashboard', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  const attentionProjects = projects.filter(p => ['new', 'missing_data', 'data_review'].includes(p.status))
  const activeProjects = projects.filter(p => ['assigned', 'design_in_progress', 'qa_review'].includes(p.status))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Management Overview</h1>
        <p className="text-sm text-slate-500 mt-1">High-level view of all operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-xl">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Projects</p>
              <p className="text-2xl font-bold text-slate-900">{stats?.total_projects || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-xl">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Active Projects</p>
              <p className="text-2xl font-bold text-slate-900">{stats?.active_projects || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 rounded-xl">
              <Users className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Leads</p>
              <p className="text-2xl font-bold text-slate-900">{stats?.total_leads || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-50 rounded-xl">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Delivered</p>
              <p className="text-2xl font-bold text-slate-900">{stats?.delivered_projects || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Design Team</p>
              <p className="text-lg font-semibold text-slate-900">{stats?.designer_count || 0} designers</p>
            </div>
            <Link to="/admin/team" className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 transition-colors">
              View <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Pending Follow-ups</p>
              <p className="text-lg font-semibold text-slate-900">{stats?.pending_followups || 0}</p>
            </div>
            <Link to="/sales/followups" className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 transition-colors">
              View <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">New Inquiries</p>
              <p className="text-lg font-semibold text-slate-900">{stats?.new_projects || 0}</p>
            </div>
            <Link to="/admin/projects" className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 transition-colors">
              View Board <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Needs Attention */}
      {attentionProjects.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h2 className="font-semibold text-slate-900">Needs Attention</h2>
            </div>
            <span className="text-sm text-slate-400">{attentionProjects.length} items</span>
          </div>
          <div className="divide-y divide-slate-100">
            {attentionProjects.map(p => (
              <Link key={p.id} to="/admin/projects" className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-medium text-slate-900">{p.name}</p>
                  <p className="text-sm text-slate-500">{p.project_type} · {p.location}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  p.status === 'missing_data' ? 'bg-red-50 text-red-600' :
                  p.status === 'new' ? 'bg-blue-50 text-blue-600' :
                  'bg-amber-50 text-amber-600'
                }`}>
                  {p.status.replace(/_/g, ' ')}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Active Projects */}
      {activeProjects.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <h2 className="font-semibold text-slate-900">Active Projects</h2>
            </div>
            <Link to="/admin/projects" className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 transition-colors">
              View Board <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {activeProjects.map(p => (
              <div key={p.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-slate-900">{p.name}</p>
                  <p className="text-sm text-slate-500">{p.project_type} · {p.location}</p>
                  {p.deadline && (
                    <p className="text-xs text-slate-400 mt-1">
                      Deadline: {new Date(p.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {p.designer_name && (
                    <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                      {p.designer_name}
                    </span>
                  )}
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    p.status === 'design_in_progress' ? 'bg-green-50 text-green-600' :
                    p.status === 'qa_review' ? 'bg-purple-50 text-purple-600' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    {p.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Projects */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">All Projects</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">Project</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">Client</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">Priority</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">Designer</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.capacity}kW · {p.project_type}</p>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-600">{p.client_name || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      p.status === 'delivered' ? 'bg-green-50 text-green-600' :
                      p.status === 'missing_data' ? 'bg-red-50 text-red-600' :
                      p.status === 'design_in_progress' ? 'bg-blue-50 text-blue-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {p.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      p.priority === 'high' ? 'bg-red-50 text-red-600' :
                      p.priority === 'low' ? 'bg-slate-100 text-slate-500' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {p.priority || 'medium'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-600">{p.designer_name || '—'}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">
                    {p.deadline ? new Date(p.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
