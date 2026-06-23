import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Upload, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState<any>(null)
  const [files, setFiles] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, filesRes] = await Promise.all([
          axios.get(`/api/projects/${id}`),
          axios.get(`/api/files/${id}`)
        ])
        setProject(projRes.data)
        setFiles(filesRes.data)
      } catch (err) {
        toast.error('Failed to load project')
      }
    }
    fetchData()
  }, [id])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      await axios.post(`/api/projects/${id}/files`, formData)
      toast.success('File uploaded')
      const filesRes = await axios.get(`/api/files/${id}`)
      setFiles(filesRes.data)
    } catch (err) {
      toast.error('Upload failed')
    }
  }

  if (!project) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-5 w-5" />
        Back
      </button>
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-gray-500 mt-1">{project.location}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 capitalize">
            {project.status.replace('_', ' ')}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div>
            <p className="text-sm text-gray-500">Capacity</p>
            <p className="font-medium">{project.capacity}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Type</p>
            <p className="font-medium capitalize">{project.project_type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created</p>
            <p className="font-medium">{new Date(project.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Updated</p>
            <p className="font-medium">{new Date(project.updated_at).toLocaleDateString()}</p>
          </div>
        </div>
        {project.services_required && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">Services Required</p>
            <p className="mt-1">{project.services_required}</p>
          </div>
        )}
        {project.notes && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">Notes</p>
            <p className="mt-1">{project.notes}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Files</h2>
          <label className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 cursor-pointer transition-colors">
            <Upload className="h-4 w-4" />
            Upload File
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
        <div className="divide-y">
          {files.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No files uploaded yet</p>
          ) : (
            files.map((file: any) => (
              <div key={file.id} className="flex items-center gap-3 py-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <span className="flex-1">{file.original_name}</span>
                <span className="text-sm text-gray-500">{new Date(file.created_at).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
