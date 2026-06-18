import { useState, useEffect } from 'react'
import { CheckSquare, Square, Upload, FileText, Download } from 'lucide-react'
import { useProjectStore } from '../../store/useApiStores'
import API from '../../utils/api'
import toast from 'react-hot-toast'

const checklist = [
  { id: 1, label: 'Review uploaded site photos', done: false },
  { id: 2, label: 'Verify site address and KML', done: true },
  { id: 3, label: 'Run shadow analysis (Skelion)', done: false },
  { id: 4, label: 'Generate 3D layout', done: false },
  { id: 5, label: 'Prepare report PDF', done: false },
]

export default function ProjectWorkspace() {
  const { projects, fetchProjects } = useProjectStore()
  const activeProject = projects.find(p => p.status === 'design_in_progress' || p.status === 'assigned')
  
  const [items, setItems] = useState(checklist)
  const [outputs, setOutputs] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (activeProject) {
      fetchOutputs()
    }
  }, [activeProject])

  const fetchOutputs = async () => {
    if (!activeProject) return
    try {
      const { data } = await API.get(`/files/outputs/${activeProject.id}`)
      setOutputs(data)
    } catch (err) {
      console.error('Failed to load outputs', err)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeProject) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      await API.post(`/files/output/${activeProject.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Output file uploaded successfully')
      fetchOutputs()
    } catch (err) {
      toast.error('Failed to upload output file')
    } finally {
      setUploading(false)
      if (e.target) e.target.value = ''
    }
  }

  const downloadFile = async (fileId: string, name: string) => {
    try {
      const response = await API.get(`/files/download-output/${fileId}`, { responseType: 'blob' })
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

  if (!activeProject) return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="card p-12 text-center">
        <h3 className="font-display font-medium text-ink">No Active Project</h3>
        <p className="text-sm text-gray-500 mt-1">You have no projects currently in design. Check your tasks.</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Project Workspace</h1>
        <p className="text-gray-500 mt-1">{activeProject.name} · {activeProject.location}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-display font-semibold text-ink mb-4">Design Checklist</h2>
          <div className="space-y-3">
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
          <div className="mt-4 pt-4 border-t border-gray-50">
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-brand-500 h-2 rounded-full transition-all" style={{ width: `${(items.filter(i => i.done).length / items.length) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1">{items.filter(i => i.done).length}/{items.length} complete</p>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-display font-semibold text-ink mb-4">Upload Output Files</h2>
          <label className="block border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-brand-500/50 transition-colors cursor-pointer">
            <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">{uploading ? 'Uploading...' : 'Drop files or click to upload'}</p>
            <p className="text-xs text-gray-400 mt-1">PDFs, images, CAD files</p>
            <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>
          <div className="mt-4 space-y-2">
            {outputs.map(o => (
              <div key={o.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-ink">{o.original_name}</span>
                </div>
                <Download onClick={() => downloadFile(o.id, o.original_name)} className="h-4 w-4 text-gray-300 hover:text-brand-500 cursor-pointer transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
