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
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-5 w-5" />
        Back
      </button>
      <h1 className="text-2xl font-bold mb-6">New Project</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (kW)</label>
            <input
              type="text"
              value={form.capacity}
              onChange={e => setForm({ ...form, capacity: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
            <select
              value={form.project_type}
              onChange={e => setForm({ ...form, project_type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Services Required</label>
          <textarea
            value={form.services_required}
            onChange={e => setForm({ ...form, services_required: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
          <textarea
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={2}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Creating...' : 'Create Project'}
        </button>
      </form>
    </div>
  )
}
