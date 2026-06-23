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
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/portal/projects/new"
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <PlusCircle className="h-5 w-5" />
          New Project
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-8 w-8 text-primary-600" />
            <div>
              <p className="text-sm text-gray-500">Total Projects</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-solar-500" />
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Recent Projects</h2>
        </div>
        <div className="divide-y">
          {recentProjects.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No projects yet. Create your first project!</div>
          ) : (
            recentProjects.map((project: any) => (
              <Link
                key={project.id}
                to={`/portal/projects/${project.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium">{project.name}</p>
                  <p className="text-sm text-gray-500">{project.location}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 capitalize">
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
