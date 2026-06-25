import { useEffect, useState } from 'react'
import { Users, Clock, MoreVertical, TrendingUp, Plus, X } from 'lucide-react'
import API from '../../utils/api'
import toast from 'react-hot-toast'

interface TeamMember {
  id: string; user_id: string; name: string; role: string; department: string;
  email: string; phone: string; status: string; avatar: string;
  active: number; completed: number; capacity: number;
}

const DEPT_LABELS: Record<string, string> = {
  design: 'Design', operations: 'Operations', sales: 'Sales',
  quality: 'Quality', finance: 'Finance', hr: 'HR',
}

const ROLES = ['client', 'sales', 'designer', 'admin']
const DEPARTMENTS = ['design', 'operations', 'sales', 'quality', 'finance', 'hr']

export default function TeamManagement() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'designer', department: 'design' })
  const [saving, setSaving] = useState(false)

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

  const handleCreateUser = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.password.trim()) {
      toast.error('All fields are required')
      return
    }
    setSaving(true)
    try {
      await API.post('/api/auth/create-user', form)
      toast.success(`${form.role.charAt(0).toUpperCase() + form.role.slice(1)} created successfully`)
      setShowAdd(false)
      setForm({ name: '', email: '', phone: '', password: '', role: 'designer', department: 'design' })
      fetchData()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to create user')
    } finally {
      setSaving(false)
    }
  }

  const totalActive = team.reduce((sum, d) => sum + d.active, 0)
  const avgUtilization = team.length > 0
    ? Math.round(team.reduce((sum, d) => sum + d.capacity, 0) / team.length)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Team Management</h1>
          <p className="text-gray-500 mt-1">Manage team members and their workload</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Team Member
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center mb-2">
            <Users className="h-5 w-5 text-primary-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{team.length}</p>
          <p className="text-sm text-gray-500">Total Team Members</p>
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
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-900">All Team Members ({team.length})</h2>
        </div>
        <div className="divide-y">
          {team.length === 0 ? (
            <p className="p-8 text-center text-gray-500">No team members yet. Add one to get started.</p>
          ) : (
            team.map((d) => (
              <div key={d.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {d.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 text-sm">{d.name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
                      {d.role}
                    </span>
                    <span className="text-xs text-gray-400">{DEPT_LABELS[d.department] || d.department}</span>
                  </div>
                  <p className="text-xs text-gray-400">{d.email}</p>
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
                      <span className="text-gray-400">Load</span>
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
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Team Member Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Add Team Member</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Full name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{DEPT_LABELS[d]}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="name@firstfront.in" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 XXXXX XXXXX" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Minimum 6 characters" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleCreateUser} disabled={saving}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">
                {saving ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
