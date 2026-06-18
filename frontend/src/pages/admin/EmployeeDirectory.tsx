import { useState, useEffect } from 'react'
import { Search, Plus, Mail, Phone, Calendar, MoreVertical, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useEmployeeStore } from '../../store/useApiStores'

const departments = ['All', 'Design', 'Operations', 'Sales', 'Quality', 'Finance', 'HR']
const statusStyles: Record<string, string> = {
  active: 'bg-success-bg text-success',
  probation: 'bg-warning-bg text-warning',
  inactive: 'bg-gray-100 text-gray-500',
}

export default function EmployeeDirectory() {
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const { employees: EMPLOYEES, loading, fetchEmployees } = useEmployeeStore()

  useEffect(() => { fetchEmployees() }, [fetchEmployees])

  if (loading) return (
    <div className="space-y-6">
      <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
      <p className="h-4 bg-gray-100 rounded w-48 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
            <div className="h-3 bg-gray-100 rounded w-1/4 mb-3" />
            <div className="space-y-2 pt-3 border-t border-gray-50">
              <div className="h-3 bg-gray-100 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const filtered = EMPLOYEES.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase())
    const matchesDept = dept === 'All' || e.department === dept
    return matchesSearch && matchesDept
  })

  const deptCounts = EMPLOYEES.reduce((acc, e) => {
    acc[e.department] = (acc[e.department] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Employee Directory</h1>
          <p className="text-gray-500 mt-1">{EMPLOYEES.length} team members across {Object.keys(deptCounts).length} departments</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Employee
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..." className="input-field pl-10" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {departments.map(d => (
            <button key={d} onClick={() => setDept(d)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                dept === d ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              {d}{d !== 'All' && ` (${deptCounts[d] || 0})`}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-400">No employees match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(e => (
            <div key={e.id} className="card p-5 hover:shadow-elevated transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-sm font-bold flex items-center justify-center">
                    {e.avatar}
                  </div>
                  <div>
                    <p className="font-display font-medium text-ink">{e.name}</p>
                    <p className="text-xs text-gray-500">{e.role}</p>
                  </div>
                </div>
                <button className="p-1 text-gray-300 hover:text-gray-500 rounded">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[e.status]}`}>{e.status}</span>
                <span className="text-xs text-gray-400">{e.department}</span>
              </div>
              <div className="space-y-1.5 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Mail className="h-3 w-3 text-gray-400" /> {e.email}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Phone className="h-3 w-3 text-gray-400" /> {e.phone}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3 text-gray-400" /> Joined {e.join_date}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-xl shadow-modal max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg text-ink">Add New Employee</h2>
              <button onClick={() => setShowAdd(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Full Name</label>
                  <input type="text" placeholder="e.g. Riya Sharma" className="input-field !text-sm !py-2" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Department</label>
                  <select className="input-field !text-sm !py-2">
                    {departments.filter(d => d !== 'All').map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Role</label>
                  <input type="text" placeholder="e.g. Junior Designer" className="input-field !text-sm !py-2" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Join Date</label>
                  <input type="date" className="input-field !text-sm !py-2" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Email</label>
                  <input type="email" placeholder="riya@firstfront.in" className="input-field !text-sm !py-2" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Phone</label>
                  <input type="tel" placeholder="+91 98765 00000" className="input-field !text-sm !py-2" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-100">
              <button onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
              <button onClick={() => { setShowAdd(false); toast.success('Employee added successfully') }} className="btn-primary">Add Employee</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
