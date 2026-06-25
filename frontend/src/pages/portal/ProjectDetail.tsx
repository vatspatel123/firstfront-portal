import { useState, useEffect } from 'react'
import { ArrowLeft, Download, Send, Clock, FileText } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import API from '../../utils/api'
import { useAuthStore } from '../../store/authStore'

const STATUS_FLOW: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700' },
  data_review: { label: 'Data Review', color: 'bg-purple-100 text-purple-700' },
  missing_data: { label: 'Missing Data', color: 'bg-warning-bg text-warning' },
  data_complete: { label: 'Data Complete', color: 'bg-brand-50 text-brand-600' },
  assigned: { label: 'Assigned', color: 'bg-sun-100 text-sun-700' },
  design_in_progress: { label: 'In Design', color: 'bg-sun-100 text-sun-700' },
  ready: { label: 'Ready', color: 'bg-success-bg text-success' },
  qa_review: { label: 'QA Review', color: 'bg-purple-100 text-purple-700' },
  approved: { label: 'Approved', color: 'bg-success-bg text-success' },
  delivered: { label: 'Delivered', color: 'bg-success-bg text-success' },
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [project, setProject] = useState<any>(null)
  const [files, setFiles] = useState<any[]>([])
  const [outputs, setOutputs] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    if (!id) return
    setLoading(true)
    try {
      const [projRes, filesRes, outputsRes, msgsRes] = await Promise.all([
        API.get(`/api/projects/${id}`),
        API.get(`/api/projects/${id}/files`),
        API.get(`/api/projects/${id}/outputs`),
        API.get(`/api/messages/?project_id=${id}`)
      ])
      setProject(projRes.data)
      setFiles(filesRes.data)
      setOutputs(Array.isArray(outputsRes.data) ? outputsRes.data : [])
      setMessages(msgsRes.data)
    } catch (err) {
      toast.error('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const ALLOWED_TYPES = [
    'application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/tiff',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv', 'application/zip', 'text/plain',
  ]
  const MAX_SIZE_MB = 50

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !id) return
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|jpe?g|png|webp|tiff?|xlsx?|csv|zip|txt)$/i)) {
      toast.error(`File type not allowed: ${file.type || file.name.split('.').pop()}`)
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File exceeds ${MAX_SIZE_MB}MB limit`)
      return
    }
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      await API.post(`/api/files/upload/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('File uploaded successfully')
      const filesRes = await API.get(`/api/projects/${id}/files`)
      setFiles(filesRes.data)
    } catch (err) {
      toast.error('Failed to upload file')
    } finally {
      setUploading(false)
      if (e.target) e.target.value = ''
    }
  }

  const downloadFile = async (fileId: string, name: string, isOutput = false) => {
    try {
      const url = isOutput ? `/api/files/download-output/${fileId}` : `/api/files/download/${fileId}`
      const response = await API.get(url, { responseType: 'blob' })
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = blobUrl
      link.setAttribute('download', name)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      toast.error('Failed to download file')
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !id) return
    try {
      const { data } = await API.post('/api/messages/', { project_id: id, text: message })
      setMessages(prev => [...prev, data])
      setMessage('')
    } catch (err) {
      toast.error('Failed to send message')
    }
  }

  if (loading) return (
    <div className="flex justify-center p-8">
      <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  )

  if (!project) return <div className="text-center py-10 text-slate-500">Project not found</div>

  const status = STATUS_FLOW[project.status] || { label: project.status, color: 'bg-slate-100 text-slate-600' }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 -ml-2 inline-flex transition-all">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{project.name}</h1>
          <p className="text-sm text-slate-500">{project.services_required} · {project.location} · {project.capacity} kW</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.color}`}>{status.label}</span>
      </div>

      {/* Project Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs text-slate-400">Capacity</p>
          <p className="font-medium text-slate-900">{project.capacity}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs text-slate-400">Type</p>
          <p className="font-medium text-slate-900 capitalize">{project.project_type}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs text-slate-400">Created</p>
          <p className="font-medium text-slate-900">{new Date(project.created_at).toLocaleDateString()}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs text-slate-400">Designer</p>
          <p className="font-medium text-slate-900">{project.designer_name || 'Not assigned'}</p>
        </div>
      </div>

      {project.notes && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs text-slate-400 mb-1">Notes</p>
          <p className="text-sm text-slate-900">{project.notes}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Uploaded Files */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-slate-900">Uploaded Files</h2>
            <label className="border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-all text-xs px-3 py-1.5 cursor-pointer font-medium">
              {uploading ? 'Uploading...' : 'Upload File'}
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </label>
          </div>
          {files.length === 0 ? (
            <p className="text-sm text-slate-400">No files uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {files.map((f: any) => (
                <div key={f.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-900">{f.original_name}</span>
                  </div>
                  <Download onClick={() => downloadFile(f.id, f.original_name)} className="h-4 w-4 text-slate-400 hover:text-blue-500 cursor-pointer transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Outputs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Project Outputs</h2>
          {outputs.length === 0 ? (
            <div className="text-center py-6">
              <Clock className="h-8 w-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No outputs yet. Check back once design is in progress.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {outputs.map((o: any) => (
                <div key={o.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-900">{o.original_name}</span>
                  </div>
                  <Download onClick={() => downloadFile(o.id, o.original_name, true)} className="h-4 w-4 text-slate-400 hover:text-blue-500 cursor-pointer transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h2 className="font-semibold text-slate-900 mb-3">Messages</h2>
        <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-2">No messages yet.</p>
          ) : (
            messages.map((m: any) => {
              const isMe = m.sender_id === user?.id
              return (
                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-xl px-3 py-2 ${
                    isMe ? 'bg-blue-600 text-white' : 'bg-slate-50'
                  }`}>
                    {!isMe && <p className="font-medium text-xs text-blue-600 mb-1">{m.sender_name}</p>}
                    <p className={`text-sm ${isMe ? 'text-white' : 'text-slate-900'}`}>{m.text}</p>
                    <p className={`text-[10px] mt-1 ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                      {new Date(m.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
        <div className="flex gap-2">
          <input type="text" value={message} onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..." className="flex-1 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 px-4 py-2.5" />
          <button disabled={!message.trim()} onClick={handleSendMessage}
            className="bg-blue-600 text-white rounded-xl px-4 py-2.5 hover:bg-blue-700 transition-all duration-200 font-medium flex items-center gap-2">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
