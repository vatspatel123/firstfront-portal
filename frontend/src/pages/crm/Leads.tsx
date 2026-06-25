import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../../utils/api'
import { Plus, Search } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Leads() {
  const [leads, setLeads] = useState([])
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', company: '', phone: '', email: '', requirement: '' })

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const res = await API.get('/api/leads/')
      setLeads(res.data)
    } catch (err) {
      console.error('Failed to load leads', err)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await API.post('/api/leads/', form)
      toast.success('Lead added')
      setShowAdd(false)
      setForm({ name: '', company: '', phone: '', email: '', requirement: '' })
      fetchLeads()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to add lead')
    }
  }

  const filtered = leads.filter((l: any) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.company.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Leads</h1>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium">
          <Plus className="h-5 w-5" />
          Add Lead
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search leads..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {showAdd && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm hover:shadow-md transition-all duration-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">New Lead</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4">
            <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
            <input placeholder="Company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
            <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
            <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            <textarea placeholder="Requirement" value={form.requirement} onChange={e => setForm({ ...form, requirement: e.target.value })} className="col-span-2 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" rows={2} />
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium">Save</button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-all">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <p className="p-8 text-center text-slate-500">No leads found</p>
          ) : (
            filtered.map((lead: any) => (
              <Link key={lead.id} to={`/sales/leads/${lead.id}`} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-all">
                <div>
                  <p className="font-medium text-slate-900">{lead.name}</p>
                  <p className="text-sm text-slate-500">{lead.company}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                  {lead.status.replace('_', ' ')}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
