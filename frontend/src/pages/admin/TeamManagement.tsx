import { useEffect, useState } from 'react'
import { Users, Clock, TrendingUp, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import API from '../../utils/api'

interface TeamMember {
  id: string; user_id: string; name: string; role: string; department: string;
  email: string; phone: string; status: string; avatar: string;
  active: number; completed: number; capacity: number;
}

const DEPT_LABELS: Record<string, string> = {
  design: 'Design', operations: 'Operations', sales: 'Sales',
  quality: 'Quality', finance: 'Finance', hr: 'HR',
}

export default function TeamManagement() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [empRes, projectsRes] = await Promise.all([
        API.get('/api/employees/'),
        API.get('/api/projects/')
      ])
      const employees = empRes.data
      const projects = projectsRes.data

      const teamList = employees.map((emp: any) => {
        const activeProjects = projects.filter((p: any) =>
          p.assigned_to === emp.user_id && !['delivered', 'new'].includes(p.status)
        ).length
        const completedProjects = projects.filter((p: any) =>
          p.assigned_to === emp.user_id && p.status === 'delivered'
        ).length
        const capacity = Math.min(100, (activeProjects / 8) * 100)

        return {
          id: emp.id, user_id: emp.user_id, name: emp.name, role: emp.role,
          department: emp.department, email: emp.email, phone: emp.phone,
          status: emp.status, avatar: emp.avatar,
          active: activeProjects, completed: completedProjects,
          capacity: Math.round(capacity),
        }
      })
      setTeam(teamList)
    } catch (err) {
      console.error('Failed to load team data', err)
    } finally {
      setLoading(false)
    }
  }

  const totalActive = team.reduce((sum, d) => sum + d.active, 0)
  const avgUtilization = team.length > 0
    ? Math.round(team.reduce((sum, d) => sum + d.capacity, 0) / team.length)
    : 0

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Team Management</h1>
          <p className="text-sm text-slate-500 mt-1">View team workload and utilization</p>
        </div>
        <button onClick={() => navigate('/admin/employees')}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium flex items-center gap-2">
          Add Team Member <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-2">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{team.length}</p>
          <p className="text-sm text-slate-500">Total Team Members</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-6">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-2">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalActive}</p>
          <p className="text-sm text-slate-500">Active Projects</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-6">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{avgUtilization}%</p>
          <p className="text-sm text-slate-500">Avg. Utilization</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">All Team Members ({team.length})</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {team.length === 0 ? (
            <p className="p-8 text-center text-slate-500">No team members yet. Add one from Employee Directory.</p>
          ) : (
            team.map((d) => (
              <div key={d.id} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {d.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900 text-sm">{d.name}</p>
                    <span className="text-xs px-3 py-1 rounded-full font-medium bg-slate-100 text-slate-600">
                      {d.role}
                    </span>
                    <span className="text-xs text-slate-400">{DEPT_LABELS[d.department] || d.department}</span>
                  </div>
                  <p className="text-xs text-slate-400">{d.email}</p>
                </div>
                <div className="hidden sm:flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-slate-900">{d.active}</p>
                    <p className="text-xs text-slate-400">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-green-600">{d.completed}</p>
                    <p className="text-xs text-slate-400">Done</p>
                  </div>
                  <div className="w-24">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">Load</span>
                      <span className="font-medium text-slate-900">{d.capacity}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${d.capacity > 90 ? 'bg-red-500' : d.capacity > 70 ? 'bg-amber-500' : 'bg-green-500'}`}
                        style={{ width: `${d.capacity}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
