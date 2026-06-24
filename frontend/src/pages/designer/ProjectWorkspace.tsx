import { useState, useEffect } from 'react'
import { CheckSquare, Square, Upload, FileText, Download, FolderOpen, Calendar, Clock } from 'lucide-react'
import API from '../../utils/api'
import toast from 'react-hot-toast'

const DEFAULT_CHECKLIST = [
  { id: 1, label: 'Review uploaded site photos', done: false },
  { id: 2, label: 'Verify site address and KML', done: false },
  { id: 3, label: 'Run shadow analysis', done: false },
  { id: 4, label: 'Generate 3D layout', done: false },
  { id: 5, label: 'Prepare report PDF', done: false },
]

export default function ProjectWorkspace() {
  const [projects, setProjects] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [items, setItems] = useState(DEFAULT_CHECKLIST)
  const [outputs, setOutputs] = useState<any[]>([])
  const [inputs, setInputs] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  const activeProject = projects.find(p => p.id === selectedId) || projects.find(p => ['assigned', 'design_in_progress'].includes(p.status))

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get('/api/projects/', { params: { assigned_to_me: true } })
        const data = Array.isArray(res.data) ? res.data : []
        setProjects(data)
      } catch (err) {
        console.error('Failed to load projects', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (activeProject) {
      fetchFiles()
      setSelectedId(activeProject.id)
    }
  }, [activeProject?.id])

  const fetchFiles = async () => {
    if (!activeProject) return
    try {
      const [outRes, inRes] = await Promise.all([
        API.get(`/api/projects/${activeProject.id}/outputs`),
        API.get(`/api/projects/${activeProject.id}/files`)
      ])
      setOutputs(Array.isArray(outRes.data) ? outRes.data : [])
      setInputs(Array.isArray(inRes.data) ? inRes.data : [])
    } catch (err) {
      console.error('Failed to load files', err)
    }
  }

  const handleOutputUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeProject) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      await API.post(`/api/files/output/${activeProject.id}`, formData, {
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

  const handleInputUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeProject) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      await API.post(`/api/files/upload/${activeProject.id}`, formData, {
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

  const downloadFile = async (fileId: string, name: string, type: 'input' | 'output') => {
    try {
      const url = type === 'output' ? `/api/projects/download-output/${fileId}` : `/api/projects/download/${fileId}`
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

  const toggleItem = (id: number) => setItems(items.map(i => i.id === id ? { ...i, done: !i.done } : i))

  const progress = items.length > 0 ? (items.filter(i => i.done).length / items.length) * 100 : 0

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!activeProject) return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Project Workspace</h1>
        <p className="text-gray-500 mt-1">Select a project to start working</p>
      </div>
      <div className="card p-12 text-center">
        <FolderOpen className="h-12 w-12 text-gray-200 mx-auto mb-3" />
        <h3 className="font-medium text-ink">No Assigned Projects</h3>
        <p className="text-sm text-gray-500 mt-1">Ask admin to assign you a project first</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Project Workspace</h1>
          <p className="text-gray-500 mt-1">{activeProject.name} · {activeProject.location}</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{activeProject.client_name || 'Client'}</span>
          </div>
          {activeProject.deadline && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Due {new Date(activeProject.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
            </div>
          )}
        </div>
      </div>

      {/* Project Selector */}
      {projects.length > 1 && (
        <div className="card p-4">
          <p className="text-sm font-medium text-ink mb-2">Switch Project</p>
          <div className="flex gap-2 flex-wrap">
            {projects.filter(p => ['assigned', 'design_in_progress'].includes(p.status)).map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeProject.id === p.id
                    ? 'bg-brand-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Checklist */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-ink mb-4">Design Checklist</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <button key={item.id} onClick={() => toggleItem(item.id)}
                className="w-full flex items-center gap-3 text-left transition-colors hover:bg-gray-50 rounded-lg p-2 -mx-2">
                {item.done ? (
                  <CheckSquare className="h-5 w-5 text-success shrink-0" />
                ) : (
                  <Square className="h-5 w-5 text-gray-300 shrink-0" />
                )}
                <span className={`text-sm ${item.done ? 'text-gray-400 line-through' : 'text-ink'}`}>{item.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-brand-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1">{items.filter(i => i.done).length}/{items.length} complete</p>
          </div>
        </div>

        {/* Files */}
        <div className="space-y-4">
          {/* Output Files */}
          <div className="card p-5">
            <h2 className="font-display font-semibold text-ink mb-4">Design Outputs</h2>
            <label className="block border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-brand-500/50 transition-colors cursor-pointer">
              <Upload className="h-6 w-6 text-gray-300 mx-auto mb-1" />
              <p className="text-sm text-gray-500">{uploading ? 'Uploading...' : 'Upload deliverables'}</p>
              <input type="file" className="hidden" onChange={handleOutputUpload} disabled={uploading} />
            </label>
            <div className="mt-3 space-y-2">
              {outputs.map(o => (
                <div key={o.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-ink">{o.original_name}</span>
                  </div>
                  <Download onClick={() => downloadFile(o.id, o.original_name, 'output')} className="h-4 w-4 text-gray-400 hover:text-brand-500 cursor-pointer transition-colors" />
                </div>
              ))}
              {outputs.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No outputs uploaded yet</p>}
            </div>
          </div>

          {/* Input Files */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-ink">Site Data</h2>
              <label className="text-xs text-brand-600 hover:text-brand-700 cursor-pointer flex items-center gap-1">
                <Upload className="h-3 w-3" /> Upload
                <input type="file" className="hidden" onChange={handleInputUpload} disabled={uploading} />
              </label>
            </div>
            <div className="space-y-2">
              {inputs.map(f => (
                <div key={f.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-ink">{f.original_name}</span>
                  </div>
                  <Download onClick={() => downloadFile(f.id, f.original_name, 'input')} className="h-4 w-4 text-gray-400 hover:text-brand-500 cursor-pointer transition-colors" />
                </div>
              ))}
              {inputs.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No site data uploaded yet</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
