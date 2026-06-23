import { useEffect, useState } from 'react'
import { Users, Clock, MoreVertical, TrendingUp } from 'lucide-react'
import api from '../../services/api'

interface Designer {
  id: string
  name: string
  role: string
  avatar: string
  active: number
  completed: number
  capacity: number
  status: string
}

const statusStyles: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  available: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'Available' },
  busy: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', label: 'At capacity' },
}

export default function TeamManagement() {
  const [designers, setDesigners] = useState<Designer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, projectsRes] = await Promise.all([
          api.get('/employees/'),
          api.get('/projects/')
        ])
        const employees = empRes.data
        const projects = projectsRes.data

        const designerList = employees
          .filter((e: any) => e.department === 'design')
          .map((emp: any) => {
            const activeProjects = projects.filter((p: any) =>
              p.assigned_to === emp.user_id && !['delivered', 'new'].includes(p.status)
            ).length
            const completedProjects = projects.filter((p: any) =>
              p.assigned_to === emp.user_id && p.status === 'delivered'
            ).length
            const capacity = Math.min(100, (activeProjects / 8) * 100)

            return {
              id: emp.id,
              name: emp.name,
              role: emp.role,
              avatar: emp.avatar,
              active: activeProjects,
              completed: completedProjects,
              capacity: Math.round(capacity),
              status: capacity >= 90 ? 'busy' : 'available'
            }
          })
        setDesigners(designerList)
      } catch (err) {
        console.error('Failed to load team data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const totalActive = designers.reduce((sum, d) => sum + d.active, 0)
  const avgUtilization = designers.length > 0
    ? Math.round(designers.reduce((sum, d) => sum + d.capacity, 0) / designers.length)
    : 0

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Team & Designer Management</h1>
        <p className="text-gray-500 mt-1">Monitor workload and assign projects</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{designers.length}</p>
          <p className="text-sm text-gray-500">Total Designers</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mb-2">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalActive}</p>
          <p className="text-sm text-gray-500">Active Projects</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{avgUtilization}%</p>
          <p className="text-sm text-gray-500">Avg. Utilization</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Design Team</h2>
          <button className="bg-primary-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-700">+ Add Designer</button>
        </div>
        <div className="divide-y">
          {designers.length === 0 ? (
            <p className="p-8 text-center text-gray-500">No designers found. Add employees in the Employee Directory.</p>
          ) : (
            designers.map((d) => {
              const s = statusStyles[d.status] || statusStyles.available
              return (
                <div key={d.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {d.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 text-sm">{d.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.bg} ${s.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot} mr-1.5 inline-block`} />{s.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{d.role}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-gray-900">{d.active}</p>
                      <p className="text-xs text-gray-400">Active</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-green-600">{d.completed}</p>
                      <p className="text-xs text-gray-400">Done</p>
                    </div>
                    <div className="w-24">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400">Capacity</span>
                        <span className="font-medium text-gray-900">{d.capacity}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${d.capacity > 90 ? 'bg-red-500' : d.capacity > 70 ? 'bg-amber-500' : 'bg-green-500'}`}
                          style={{ width: `${d.capacity}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="text-primary-600 text-sm px-3 py-1.5 rounded-lg hover:bg-primary-50">Assign</button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
