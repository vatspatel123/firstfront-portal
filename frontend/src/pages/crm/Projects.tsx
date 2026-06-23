import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../../utils/api'

export default function CrmProjects() {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await API.get('/api/projects/')
        setProjects(res.data)
      } catch (err) {
        console.error('Failed to load projects', err)
      }
    }
    fetchProjects()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">All Projects</h1>
      <div className="bg-white rounded-xl border">
        <div className="divide-y">
          {projects.length === 0 ? (
            <p className="p-8 text-center text-gray-500">No projects yet</p>
          ) : (
            projects.map((project: any) => (
              <Link key={project.id} to={`/portal/projects/${project.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50">
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
