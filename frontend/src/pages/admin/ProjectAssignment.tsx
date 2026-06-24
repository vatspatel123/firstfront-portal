import { useEffect, useState } from 'react'
import { Search, ChevronDown, Calendar, UserCheck, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { useProjectStore, useEmployeeStore } from '../../store/useApiStores'
import API from '../../utils/api'

export default function ProjectAssignment() {
  const { projects, loading: projectsLoading, fetchProjects } = useProjectStore()
  const { employees, loading: employeesLoading, fetchEmployees } = useEmployeeStore()
  const [search, setSearch] = useState('')
  const [scopeNotes, setScopeNotes] = useState<Record<string, string>>({})
  const [deadlines, setDeadlines] = useState<Record<string, string>>({})
  const [assigning, setAssigning] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
    fetchEmployees()
  }, [])

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.client_name && p.client_name.toLowerCase().includes(search.toLowerCase())) ||
    (p.designer_name && p.designer_name.toLowerCase().includes(search.toLowerCase()))
  )

  const unassigned = filtered.filter(p => !p.assigned_to)

  const handleAssignDesigner = async (projectId: string, designerUserId: string) => {
    if (!designerUserId) {
      try {
        await API.patch(`/api/projects/${projectId}/status`, { status: 'new', assigned_to: null })
        toast.success('Project unassigned')
        fetchProjects()
      } catch {
        toast.error('Failed to unassign')
      }
      return
    }

    setAssigning(projectId)
    try {
      const deadline = deadlines[projectId] ? new Date(deadlines[projectId]).toISOString() : undefined
      const scope = scopeNotes[projectId] || ''

      await API.patch(`/api/projects/${projectId}/status`, {
        status: 'assigned',
        assigned_to: designerUserId,
        deadline,
        note: scope || undefined
      })

      const designer = employees.find(e => e.user_id === designerUserId)
      toast.success(designer ? `Assigned to ${designer.name}` : 'Project assigned')
      fetchProjects()
      setScopeNotes(prev => { const n = { ...prev }; delete n[projectId]; return n })
      setDeadlines(prev => { const n = { ...prev }; delete n[projectId]; return n })
    } catch {
      toast.error('Failed to assign designer')
    } finally {
      setAssigning(null)
    }
  }

  const getDeadline = (createdAtStr: string) => {
    const d = new Date(createdAtStr)
    d.setDate(d.getDate() + 7)
    return d.toISOString().split('T')[0]
  }

  const Select = ({ projectId, current }: { projectId: string; current: string | null }) => (
    <div className="relative">
      <select
        value={current || ''}
        onChange={e => handleAssignDesigner(projectId, e.target.value)}
        disabled={assigning === projectId}
        className="appearance-none input-field !py-2 !text-sm pr-8 cursor-pointer disabled:opacity-50"
      >
        <option value="">— Unassigned —</option>
        {employees.filter(e => e.department.toLowerCase() === 'design').map(e => (
          <option key={e.id} value={e.user_id}>{e.name}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
  )

  if (projectsLoading || employeesLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-1/4 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="card h-24" />)}
        </div>
        <div className="card h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Project Assignment</h1>
        <p className="text-gray-500 mt-1">Assign designers to projects, set deadlines and scope</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-2xl font-bold font-display text-ink">{projects.length}</p>
          <p className="text-sm text-gray-500">Total Projects</p>
        </div>
        <div className="card p-5">
          <p className="text-2xl font-bold font-display text-warning">{projects.filter(p => !p.assigned_to).length}</p>
          <p className="text-sm text-gray-500">Unassigned</p>
        </div>
        <div className="card p-5">
          <p className="text-2xl font-bold font-display text-success">{projects.filter(p => p.assigned_to).length}</p>
          <p className="text-sm text-gray-500">Assigned</p>
        </div>
      </div>

      {unassigned.length > 0 && (
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-warning" />
            <h2 className="font-display font-semibold text-ink">Needs Assignment ({unassigned.length})</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {unassigned.map(p => (
              <div key={p.id} className="px-5 py-4">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink text-sm">{p.name}</p>
                    <p className="text-xs text-gray-400">
                      {p.client_name || 'Client'} · {p.services_required} · {p.capacity} kW
                    </p>
                    {p.deadline && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Due {new Date(p.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <div className="w-56 shrink-0">
                    <Select projectId={p.id} current={p.assigned_to} />
                  </div>
                </div>
                {/* Scope Notes + Deadline inputs */}
                <div className="flex gap-3 mt-2">
                  <div className="flex-1 relative">
                    <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={scopeNotes[p.id] || ''}
                      onChange={e => setScopeNotes(prev => ({ ...prev, [p.id]: e.target.value }))}
                      placeholder="Scope notes for designer..."
                      className="input-field !py-1.5 !text-xs pl-8"
                    />
                  </div>
                  <div className="w-40 relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input
                      type="date"
                      value={deadlines[p.id] || getDeadline(p.created_at)}
                      onChange={e => setDeadlines(prev => ({ ...prev, [p.id]: e.target.value }))}
                      className="input-field !py-1.5 !text-xs pl-8"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between gap-3">
          <h2 className="font-display font-semibold text-ink">All Projects</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..." className="input-field !py-2 pl-9 !text-sm" />
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {filtered.map(p => (
            <div key={p.id} className="px-5 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink text-sm">{p.name}</p>
                <p className="text-xs text-gray-400">
                  {p.client_name || 'Client'} · {p.services_required} · {p.capacity} kW
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 shrink-0">
                <Calendar className="h-3 w-3" />
                {p.deadline
                  ? new Date(p.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                  : `Due ${new Date(p.created_at).getDate() + 7 > 31 ? '1' : new Date(p.created_at).getDate() + 7} ${new Date(new Date(p.created_at).getTime() + 7*86400000).toLocaleDateString('en-IN', { month: 'short' })}`
                }
              </div>
              <div className="w-56 shrink-0">
                <Select projectId={p.id} current={p.assigned_to} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
