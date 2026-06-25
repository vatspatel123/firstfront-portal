import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../../utils/api'
import { History } from 'lucide-react'

export default function ProjectHistory() {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await API.get('/api/projects/')
        setProjects(res.data.filter((p: any) => p.status === 'delivered'))
      } catch (err) {
        console.error('Failed to load history', err)
      }
    }
    fetchProjects()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Project History</h1>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        {projects.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <History className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p>No completed projects yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {projects.map((project: any) => (
              <Link
                key={project.id}
                to={`/portal/projects/${project.id}`}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-all duration-200"
              >
                <div>
                  <p className="font-medium text-slate-900">{project.name}</p>
                  <p className="text-sm text-slate-500">{project.location}</p>
                </div>
                <span className="rounded-full px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 capitalize">
                  Delivered
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
