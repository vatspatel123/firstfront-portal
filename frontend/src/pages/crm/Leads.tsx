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
        <h1 className="text-2xl font-bold">Leads</h1>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          <Plus className="h-5 w-5" />
          Add Lead
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search leads..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">New Lead</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4">
            <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="px-4 py-2 border rounded-lg" required />
            <input placeholder="Company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="px-4 py-2 border rounded-lg" required />
            <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="px-4 py-2 border rounded-lg" required />
            <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="px-4 py-2 border rounded-lg" />
            <textarea placeholder="Requirement" value={form.requirement} onChange={e => setForm({ ...form, requirement: e.target.value })} className="col-span-2 px-4 py-2 border rounded-lg" rows={2} />
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">Save</button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border">
        <div className="divide-y">
          {filtered.length === 0 ? (
            <p className="p-8 text-center text-gray-500">No leads found</p>
          ) : (
            filtered.map((lead: any) => (
              <Link key={lead.id} to={`/crm/leads/${lead.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div>
                  <p className="font-medium">{lead.name}</p>
                  <p className="text-sm text-gray-500">{lead.company}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 capitalize">
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
