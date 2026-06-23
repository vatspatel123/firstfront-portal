import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../../utils/api'
import { ArrowLeft, Phone, Mail, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lead, setLead] = useState<any>(null)
  const [note, setNote] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get(`/api/leads/${id}`)
        setLead(res.data)
      } catch (err) {
        toast.error('Failed to load lead')
      }
    }
    fetchData()
  }, [id])

  const handleAddFollowup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await API.post('/api/leads/followups', { lead_id: id, note })
      toast.success('Follow-up added')
      setNote('')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to add follow-up')
    }
  }

  const updateStatus = async (status: string) => {
    try {
      await API.patch(`/api/leads/${id}/status`, { status })
      setLead({ ...lead, status })
      toast.success('Status updated')
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  if (!lead) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>

  const statuses = ['new', 'contacted', 'interested', 'followup', 'meeting_scheduled', 'quotation_sent', 'converted', 'lost']

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-5 w-5" />
        Back
      </button>
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{lead.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-gray-500">
              <span className="flex items-center gap-1"><Building2 className="h-4 w-4" />{lead.company}</span>
              <span className="flex items-center gap-1"><Phone className="h-4 w-4" />{lead.phone}</span>
              {lead.email && <span className="flex items-center gap-1"><Mail className="h-4 w-4" />{lead.email}</span>}
            </div>
          </div>
          <select
            value={lead.status}
            onChange={e => updateStatus(e.target.value)}
            className="px-3 py-1 border rounded-lg text-sm"
          >
            {statuses.map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
        {lead.requirement && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">Requirement</p>
            <p className="mt-1">{lead.requirement}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Add Follow-up</h2>
        <form onSubmit={handleAddFollowup} className="flex gap-2">
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Follow-up note..."
            className="flex-1 px-4 py-2 border rounded-lg"
            required
          />
          <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">Add</button>
        </form>
      </div>
    </div>
  )
}
