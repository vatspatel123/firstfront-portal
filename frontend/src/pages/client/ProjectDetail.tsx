import { useState, useEffect } from 'react'
import { ArrowLeft, Download, Send, Clock, FileText } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import API from '../../utils/api'
import { useProjectStore, useMessageStore } from '../../store/useApiStores'

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
  
  const { projects, fetchProjects } = useProjectStore()
  const { messages, fetchMessages, sendMessage } = useMessageStore()
  
  const [files, setFiles] = useState<any[]>([])
  const [outputs, setOutputs] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)

  const project = projects.find(p => p.id === id)

  useEffect(() => {
    if (!project) fetchProjects()
    if (id) {
      fetchMessages(id)
      fetchFiles()
    }
  }, [id, project])

  const fetchFiles = async () => {
    try {
      const [{ data: fData }, { data: oData }] = await Promise.all([
        API.get(`/files/${id}`),
        API.get(`/files/outputs/${id}`)
      ])
      setFiles(fData)
      setOutputs(oData)
    } catch (err) {
      console.error('Failed to load files', err)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !id) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      await API.post(`/files/upload/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('File uploaded successfully')
      fetchFiles()
    } catch (err) {
      toast.error('Failed to upload file')
    } finally {
      setUploading(false)
      if (e.target) e.target.value = ''
    }
  }

  const downloadFile = async (fileId: string, name: string, isOutput = false) => {
    try {
      const url = isOutput ? `/files/download-output/${fileId}` : `/files/download/${fileId}`
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
      await sendMessage(id, message)
      setMessage('')
      toast.success('Message sent')
    } catch (err) {
      toast.error('Failed to send message')
    }
  }

  if (!project) return <div className="text-center py-10">Loading...</div>

  const status = STATUS_FLOW[project.status] || { label: project.status, color: 'bg-gray-100 text-gray-600' }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="btn-ghost flex items-center gap-2 -ml-2 inline-flex">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-semibold text-ink">{project.name}</h1>
          </div>
          <p className="text-gray-500">{project.services_required} · {project.location} · {project.capacity} kW</p>
        </div>
        <span className={`status-pill ${status.color} text-sm !px-3 !py-1.5`}>{status.label}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display font-semibold text-ink">Uploaded Files</h2>
            <label className="btn-secondary text-xs px-3 py-1.5 cursor-pointer">
              {uploading ? 'Uploading...' : 'Upload File'}
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </label>
          </div>
          {files.length === 0 ? (
            <p className="text-sm text-gray-400">No files uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {files.map((f) => (
                <div key={f.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-ink">{f.original_name}</span>
                  </div>
                  <Download onClick={() => downloadFile(f.id, f.original_name)} className="h-4 w-4 text-gray-400 hover:text-brand-500 cursor-pointer transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-display font-semibold text-ink mb-4">Project Outputs</h2>
          {outputs.length === 0 ? (
            <div className="text-center py-6">
              <Clock className="h-8 w-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No outputs yet. Check back once design is in progress.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {outputs.map((o) => (
                <div key={o.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-ink">{o.original_name}</span>
                  </div>
                  <Download onClick={() => downloadFile(o.id, o.original_name, true)} className="h-4 w-4 text-gray-400 hover:text-brand-500 cursor-pointer transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-display font-semibold text-ink mb-3">Quick Message</h2>
        <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-2">No messages yet.</p>
          ) : (
            messages.map((m) => (
              <div key={m.id} className="text-sm bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-ink text-xs mb-1">{m.sender_name}</p>
                <p className="text-gray-700">{m.text}</p>
              </div>
            ))
          )}
        </div>
        <div className="flex gap-2">
          <input type="text" value={message} onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..." className="input-field flex-1" />
          <button disabled={!message.trim()} onClick={handleSendMessage}
            className="btn-primary flex items-center gap-2 !px-4">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
