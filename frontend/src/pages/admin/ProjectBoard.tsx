import { useEffect, useState, useRef } from 'react'
import { MoreVertical, Calendar, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useProjectStore } from '../../store/useApiStores'
const BOARD_COLUMNS = [
  { id: 'new', label: 'New', color: 'border-slate-300', dot: 'bg-slate-400' },
  { id: 'data_review', label: 'Data Review', color: 'border-blue-300', dot: 'bg-blue-500' },
  { id: 'in_design', label: 'In Design', color: 'border-amber-400', dot: 'bg-amber-500' },
  { id: 'qa_review', label: 'QA Review', color: 'border-purple-300', dot: 'bg-purple-500' },
  { id: 'delivered', label: 'Delivered', color: 'border-green-500', dot: 'bg-green-700' },
]

const priorityStyles: Record<string, string> = {
  high: 'bg-red-50 text-red-600',
  medium: 'bg-amber-50 text-amber-600',
  low: 'bg-slate-100 text-slate-600',
}

const COLUMN_TO_STATUS: Record<string, string> = {
  new: 'new',
  data_review: 'data_review',
  in_design: 'design_in_progress',
  qa_review: 'qa_review',
  delivered: 'delivered',
}

const STATUS_TO_COLUMN: Record<string, string> = {
  new: 'new',
  data_review: 'data_review',
  missing_data: 'data_review',
  data_complete: 'data_review',
  assigned: 'in_design',
  design_in_progress: 'in_design',
  qa_review: 'qa_review',
  approved: 'delivered',
  delivered: 'delivered',
}

export default function ProjectBoard() {
  const { projects, loading, fetchProjects, updateStatus } = useProjectStore()
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const dragRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const moveProject = async (id: string, newColId: string) => {
    const apiStatus = COLUMN_TO_STATUS[newColId]
    const project = projects.find(p => p.id === id)
    if (!project) return

    try {
      await updateStatus(id, apiStatus)
      const col = BOARD_COLUMNS.find(c => c.id === newColId)
      if (col) toast.success(`${project.name} → ${col.label}`)
    } catch {
      toast.error(`Failed to move ${project.name}`)
    }
  }

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
  }
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }
  const onDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    if (draggedId) {
      moveProject(draggedId, status)
      setDraggedId(null)
    }
  }

  const counts = BOARD_COLUMNS.reduce((acc, col) => {
    acc[col.id] = projects.filter(p => STATUS_TO_COLUMN[p.status] === col.id).length
    return acc
  }, {} as Record<string, number>)

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Project Board</h1>
          <p className="text-sm text-slate-500 mt-1">Loading projects...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {BOARD_COLUMNS.map((col) => (
            <div key={col.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm h-96 animate-pulse p-4">
              <div className="h-6 bg-slate-100 rounded w-2/3 mb-4" />
              <div className="space-y-2">
                <div className="h-20 bg-slate-50 rounded" />
                <div className="h-20 bg-slate-50 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Project Board</h1>
        <p className="text-sm text-slate-500 mt-1">Drag projects between columns to update their status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {BOARD_COLUMNS.map((col) => {
          const colProjects = projects.filter(p => STATUS_TO_COLUMN[p.status] === col.id)
          return (
            <div
              key={col.id}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, col.id)}
              className={`bg-white rounded-2xl border-t-4 ${col.color} border border-slate-200 shadow-sm flex flex-col min-h-[500px]`}
            >
              <div className="px-3 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <h3 className="font-medium text-sm text-slate-900">{col.label}</h3>
                </div>
                <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{counts[col.id]}</span>
              </div>

              <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[600px]">
                {colProjects.map((p) => {
                  const hasDesigner = p.designer_name && p.designer_name !== 'Unassigned'
                  const initials = hasDesigner
                    ? p.designer_name!.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                    : ''

                  return (
                    <div
                      key={p.id}
                      ref={dragRef}
                      draggable
                      onDragStart={(e) => onDragStart(e, p.id)}
                      onDragEnd={() => setDraggedId(null)}
                      className={`bg-white border border-slate-200 rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md ${
                        draggedId === p.id ? 'opacity-40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-medium text-sm text-slate-900 leading-snug">{p.name}</p>
                        <button className="p-0.5 text-slate-300 hover:text-slate-500 -mr-1 -mt-1 transition-colors">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{p.client_name || 'Client'}</p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                        <Calendar className="h-3 w-3" />
                        <span>Due {p.deadline ? new Date(p.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'No deadline'}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          {hasDesigner ? (
                            <>
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-[9px] font-bold flex items-center justify-center">{initials}</div>
                              <span className="text-[11px] text-slate-500 truncate max-w-[80px]">{p.designer_name!.split(' ')[0]}</span>
                            </>
                          ) : (
                            <span className="text-[11px] text-amber-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Unassigned</span>
                          )}
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityStyles[p.priority || 'medium']}`}>{p.priority || 'medium'}</span>
                      </div>
                    </div>
                  )
                })}
                {colProjects.length === 0 && (
                  <div className="text-center py-8 text-xs text-slate-300">Drop projects here</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
