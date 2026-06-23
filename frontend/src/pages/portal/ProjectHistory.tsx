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
    <div>
      <h1 className="text-2xl font-bold mb-6">Project History</h1>
      <div className="bg-white rounded-xl border">
        {projects.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <History className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No completed projects yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {projects.map((project: any) => (
              <Link
                key={project.id}
                to={`/portal/projects/${project.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium">{project.name}</p>
                  <p className="text-sm text-gray-500">{project.location}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-solar-100 text-solar-600 capitalize">
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
