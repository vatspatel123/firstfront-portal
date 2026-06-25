import { useState, useEffect } from 'react'
import { Search, Plus, Mail, Phone, Calendar, MoreVertical, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useEmployeeStore } from '../../store/useApiStores'
import api from '../../services/api'

const departments = ['All', 'design', 'operations', 'sales', 'quality', 'finance', 'hr']
const departmentLabels: Record<string, string> = {
  design: 'Design',
  operations: 'Operations',
  sales: 'Sales',
  quality: 'Quality',
  finance: 'Finance',
  hr: 'HR',
}
const statusStyles: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  probation: 'bg-amber-100 text-amber-700',
  inactive: 'bg-gray-100 text-gray-500',
}

export default function EmployeeDirectory() {
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const { employees: EMPLOYEES, loading, fetchEmployees } = useEmployeeStore()
  const [form, setForm] = useState({
    name: '', role: '', department: 'design', email: '', phone: '', join_date: '', salary: '', password: 'firstfront123'
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchEmployees() }, [fetchEmployees])

  if (loading) return (
    <div className="flex justify-center p-8">
      <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/api/employees/', form)
      toast.success('Employee added successfully')
      setShowAdd(false)
      setForm({ name: '', role: '', department: 'design', email: '', phone: '', join_date: '', salary: '', password: 'firstfront123' })
      fetchEmployees()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to add employee')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Employee Directory</h1>
          <p className="text-gray-500 mt-1">{EMPLOYEES.length} team members across {Object.keys(deptCounts).length} departments</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Employee
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {departments.map(d => (
            <button key={d} onClick={() => setDept(d)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                dept === d ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              {d === 'All' ? 'All' : departmentLabels[d] || d}{d !== 'All' && ` (${deptCounts[d] || 0})`}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <p className="text-gray-400">No employees match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(e => (
            <div key={e.id} className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center">
                    {e.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{e.name}</p>
                    <p className="text-xs text-gray-500">{e.role}</p>
                  </div>
                </div>
                <button className="p-1 text-gray-300 hover:text-gray-500 rounded">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[e.status]}`}>{e.status}</span>
                <span className="text-xs text-gray-400">{departmentLabels[e.department] || e.department}</span>
              </div>
              <div className="space-y-1.5 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Mail className="h-3 w-3 text-gray-400" /> {e.email}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Phone className="h-3 w-3 text-gray-400" /> {e.phone}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3 text-gray-400" /> Joined {e.join_date?.slice(0,10)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg text-gray-900">Add New Employee</h2>
              <button onClick={() => setShowAdd(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full name" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                  <select value={form.department} onChange={e => setForm({...form, department: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    {departments.filter(d => d !== 'All').map(d => <option key={d} value={d}>{departmentLabels[d]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                  <input type="text" value={form.role} onChange={e => setForm({...form, role: e.target.value})} placeholder="Job title" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Join Date</label>
                  <input type="date" value={form.join_date} onChange={e => setForm({...form, join_date: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="name@firstfront.in" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 XXXXX XXXXX" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Salary</label>
                <input type="text" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} placeholder="Annual salary" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Login Password</label>
                <input type="text" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Password for login" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <p className="text-xs text-gray-400 mt-1">Default: firstfront123</p>
              </div>
              <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                  {submitting ? 'Adding...' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
