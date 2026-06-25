import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import API from '../../utils/api'

export default function CrmProjects() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const isDesigner = location.pathname.startsWith('/designer')

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await API.get('/api/projects/')
        setProjects(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        console.error('Failed to load projects', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-50 text-blue-600',
      data_review: 'bg-amber-50 text-amber-600',
      missing_data: 'bg-red-50 text-red-600',
      data_complete: 'bg-green-50 text-green-600',
      assigned: 'bg-purple-50 text-purple-600',
      design_in_progress: 'bg-primary-50 text-primary-600',
      qa_review: 'bg-indigo-50 text-indigo-600',
      approved: 'bg-green-50 text-green-600',
      delivered: 'bg-slate-100 text-slate-600',
    }
    return colors[status] || 'bg-slate-100 text-slate-600'
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">{isDesigner ? 'My Projects' : 'All Projects'}</h1>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="divide-y divide-slate-100">
          {projects.length === 0 ? (
            <p className="p-8 text-center text-slate-500">No projects yet</p>
          ) : (
            projects.map((project: any) => {
              const linkTo = isDesigner
                ? `/designer/workspace`
                : `/portal/projects/${project.id}`
              return (
                <Link key={project.id} to={linkTo} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-all">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{project.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                      <span>{project.location}</span>
                      {project.client_name && <span>· {project.client_name}</span>}
                      {project.capacity && <span>· {project.capacity}kW</span>}
                    </div>
                    {project.deadline && (
                      <p className="text-xs text-slate-400 mt-1">
                        Deadline: {new Date(project.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {project.designer_name && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full hidden sm:inline">
                        {project.designer_name}
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColor(project.status)}`}>
                      {project.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
