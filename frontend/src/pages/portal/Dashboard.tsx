import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../../utils/api'
import { PlusCircle, FolderOpen, Clock, CheckCircle } from 'lucide-react'

export default function PortalDashboard() {
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 })
  const [recentProjects, setRecentProjects] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get('/api/projects/')
        const projects = res.data
        setRecentProjects(projects.slice(0, 5))
        setStats({
          total: projects.length,
          active: projects.filter((p: any) => !['delivered'].includes(p.status)).length,
          completed: projects.filter((p: any) => p.status === 'delivered').length
        })
      } catch (err) {
        console.error('Failed to load dashboard', err)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <Link
          to="/portal/projects/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
        >
          <PlusCircle className="h-5 w-5" />
          New Project
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-6">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-slate-500">Total Projects</p>
              <p className="text-2xl font-semibold text-slate-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-6">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-sm text-slate-500">Active</p>
              <p className="text-2xl font-semibold text-slate-900">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="text-sm text-slate-500">Completed</p>
              <p className="text-2xl font-semibold text-slate-900">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Recent Projects</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {recentProjects.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No projects yet. Create your first project!</div>
          ) : (
            recentProjects.map((project: any) => (
              <Link
                key={project.id}
                to={`/portal/projects/${project.id}`}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-all duration-200"
              >
                <div>
                  <p className="font-medium text-slate-900">{project.name}</p>
                  <p className="text-sm text-slate-500">{project.location}</p>
                </div>
                <span className="rounded-full px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                  {project.status.replace('_', ' ')}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
