import { useState, useEffect } from 'react'
import { CheckSquare, Square, Upload, FileText, Download, FolderOpen, Calendar, Clock, ArrowRight } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import API from '../../utils/api'
import toast from 'react-hot-toast'

interface ChecklistItem {
  id: string
  label: string
  done: boolean
}

const STATUS_ADVANCE: Record<string, { next: string; label: string }> = {
  assigned: { next: 'design_in_progress', label: 'Start Design' },
  design_in_progress: { next: 'qa_review', label: 'Submit for Review' },
}

export default function ProjectWorkspace() {
  const [searchParams] = useSearchParams()
  const [projects, setProjects] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get('project'))
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [outputs, setOutputs] = useState<any[]>([])
  const [inputs, setInputs] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [advancing, setAdvancing] = useState(false)

  const activeProject = projects.find(p => p.id === selectedId) ||
    projects.find(p => ['assigned', 'design_in_progress'].includes(p.status))

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get('/api/projects/', { params: { assigned_to_me: true } })
        const data = Array.isArray(res.data) ? res.data : []
        setProjects(data)
        if (!selectedId && data.length > 0) {
          const active = data.find((p: any) => ['assigned', 'design_in_progress'].includes(p.status))
          if (active) setSelectedId(active.id)
        }
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
      fetchChecklist()
      setSelectedId(activeProject.id)
    }
  }, [activeProject?.id])

  const fetchChecklist = async () => {
    if (!activeProject) return
    try {
      const res = await API.get(`/api/projects/${activeProject.id}/checklist`)
      setItems(Array.isArray(res.data) ? res.data : [])
    } catch {
      setItems([])
    }
  }

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
    } catch {
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
    } catch {
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
    } catch {
      toast.error('Failed to download file')
    }
  }

  const toggleItem = async (id: string) => {
    const updated = items.map(i => i.id === id ? { ...i, done: !i.done } : i)
    setItems(updated)
    try {
      await API.put(`/api/projects/${activeProject.id}/checklist`, {
        items: updated.map(i => ({ id: i.id, label: i.label, done: i.done }))
      })
    } catch {
      toast.error('Failed to save checklist')
    }
  }

  const handleAdvanceStatus = async () => {
    if (!activeProject) return
    const advance = STATUS_ADVANCE[activeProject.status]
    if (!advance) return

    setAdvancing(true)
    try {
      await API.patch(`/api/projects/${activeProject.id}/status`, {
        status: advance.next,
        note: `Status advanced by designer`
      })
      toast.success(`Project moved to ${advance.next.replace(/_/g, ' ')}`)
      const res = await API.get('/api/projects/', { params: { assigned_to_me: true } })
      setProjects(Array.isArray(res.data) ? res.data : [])
    } catch {
      toast.error('Failed to update status')
    } finally {
      setAdvancing(false)
    }
  }

  const progress = items.length > 0 ? (items.filter(i => i.done).length / items.length) * 100 : 0
  const advanceInfo = activeProject ? STATUS_ADVANCE[activeProject.status] : null

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!activeProject) return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Project Workspace</h1>
        <p className="text-sm text-slate-500 mt-1">Select a project to start working</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
        <FolderOpen className="h-12 w-12 text-slate-200 mx-auto mb-3" />
        <h3 className="font-medium text-slate-900">No Assigned Projects</h3>
        <p className="text-sm text-slate-500 mt-1">Ask admin to assign you a project first</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Project Workspace</h1>
          <p className="text-sm text-slate-500 mt-1">{activeProject.name} · {activeProject.location}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <Clock className="h-4 w-4" />
            <span>{activeProject.client_name || 'Client'}</span>
          </div>
          {activeProject.deadline && (
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <Calendar className="h-4 w-4" />
              <span>Due {new Date(activeProject.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
            </div>
          )}
          {advanceInfo && (
            <button
              onClick={handleAdvanceStatus}
              disabled={advancing}
              className="bg-green-600 text-white text-sm py-2 px-4 rounded-xl hover:bg-green-700 transition-all duration-200 font-medium flex items-center gap-1.5 disabled:opacity-50"
            >
              {advancing ? 'Updating...' : advanceInfo.label}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {projects.length > 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <p className="text-sm font-medium text-slate-900 mb-2">Switch Project</p>
          <div className="flex gap-2 flex-wrap">
            {projects.filter(p => ['assigned', 'design_in_progress'].includes(p.status)).map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeProject.id === p.id
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Design Checklist</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <button key={item.id} onClick={() => toggleItem(item.id)}
                className="w-full flex items-center gap-3 text-left transition-colors hover:bg-slate-50 rounded-xl p-2 -mx-2">
                {item.done ? (
                  <CheckSquare className="h-5 w-5 text-green-600 shrink-0" />
                ) : (
                  <Square className="h-5 w-5 text-slate-300 shrink-0" />
                )}
                <span className={`text-sm ${item.done ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{item.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-1">{items.filter(i => i.done).length}/{items.length} complete</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Design Outputs</h2>
            <label className="block border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-blue-400/50 transition-all duration-200 cursor-pointer">
              <Upload className="h-6 w-6 text-slate-300 mx-auto mb-1" />
              <p className="text-sm text-slate-500">{uploading ? 'Uploading...' : 'Upload deliverables'}</p>
              <input type="file" className="hidden" onChange={handleOutputUpload} disabled={uploading} />
            </label>
            <div className="mt-3 space-y-2">
              {outputs.map(o => (
                <div key={o.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-900">{o.original_name}</span>
                  </div>
                  <Download onClick={() => downloadFile(o.id, o.original_name, 'output')} className="h-4 w-4 text-slate-400 hover:text-blue-600 cursor-pointer transition-colors" />
                </div>
              ))}
              {outputs.length === 0 && <p className="text-xs text-slate-400 text-center py-2">No outputs uploaded yet</p>}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Site Data</h2>
              <label className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1">
                <Upload className="h-3 w-3" /> Upload
                <input type="file" className="hidden" onChange={handleInputUpload} disabled={uploading} />
              </label>
            </div>
            <div className="space-y-2">
              {inputs.map(f => (
                <div key={f.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-900">{f.original_name}</span>
                  </div>
                  <Download onClick={() => downloadFile(f.id, f.original_name, 'input')} className="h-4 w-4 text-slate-400 hover:text-blue-600 cursor-pointer transition-colors" />
                </div>
              ))}
              {inputs.length === 0 && <p className="text-xs text-slate-400 text-center py-2">No site data uploaded yet</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
