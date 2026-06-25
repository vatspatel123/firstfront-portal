import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../../utils/api'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'

export default function NewProject() {
  const [form, setForm] = useState({
    name: '',
    location: '',
    capacity: '',
    project_type: '',
    services_required: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await API.post('/api/projects/', form)
      toast.success('Project created successfully')
      navigate('/portal')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-all">
        <ArrowLeft className="h-5 w-5" />
        Back
      </button>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">New Project</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 px-4 py-2.5"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
          <input
            type="text"
            value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
            className="w-full rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 px-4 py-2.5"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Capacity (kW)</label>
            <input
              type="text"
              value={form.capacity}
              onChange={e => setForm({ ...form, capacity: e.target.value })}
              className="w-full rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 px-4 py-2.5"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Project Type</label>
            <select
              value={form.project_type}
              onChange={e => setForm({ ...form, project_type: e.target.value })}
              className="w-full rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 px-4 py-2.5"
              required
            >
              <option value="">Select type</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
              <option value="ground_mount">Ground Mount</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Services Required</label>
          <textarea
            value={form.services_required}
            onChange={e => setForm({ ...form, services_required: e.target.value })}
            className="w-full rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 px-4 py-2.5"
            rows={3}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes</label>
          <textarea
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            className="w-full rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 px-4 py-2.5"
            rows={2}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 font-medium"
        >
          {loading ? 'Creating...' : 'Create Project'}
        </button>
      </form>
    </div>
  )
}
