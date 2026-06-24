import { useEffect, useState } from 'react'
import { Clock, AlertTriangle, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import API from '../../utils/api'

interface DesignerTask {
  id: string
  project: string
  task: string
  client: string
  priority: string
  deadline: string | null
  status: string
}

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-gray-100 text-gray-600',
}

export default function DesignerDayView() {
  const [tasks, setTasks] = useState<DesignerTask[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await API.get('/api/projects/', { params: { assigned_to_me: true } })
        const projects = Array.isArray(res.data) ? res.data : []
        const taskList: DesignerTask[] = projects
          .filter((p: any) => ['assigned', 'design_in_progress'].includes(p.status))
          .map((p: any) => ({
            id: p.id,
            project: p.name,
            task: p.services_required || 'Design work',
            client: p.client_name || 'Client',
            priority: p.priority || (p.status === 'design_in_progress' ? 'high' : 'medium'),
            deadline: p.deadline,
            status: p.status
          }))
        setTasks(taskList)
      } catch (err) {
        console.error('Failed to load tasks', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Today's Tasks</h1>
        <p className="text-gray-500 mt-1">{tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you</p>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Clock className="h-12 w-12 text-gray-200 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900">No tasks assigned</h3>
          <p className="text-sm text-gray-500 mt-1">Take a break — you're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900">{t.project}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[t.priority]}`}>{t.priority}</span>
                  </div>
                  <p className="text-sm text-gray-500">{t.task}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>Client: {t.client}</span>
                    {t.deadline && (
                      <span className={`flex items-center gap-1 ${new Date(t.deadline) < new Date() ? 'text-red-600' : 'text-amber-600'}`}>
                        <AlertTriangle className="h-3 w-3" />
                        Due {new Date(t.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                    <span className="text-gray-300">·</span>
                    <span>{t.status.replace(/_/g, ' ')}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/designer/workspace')}
                  className="bg-primary-600 text-white text-sm py-2 px-5 rounded-lg hover:bg-primary-700 shrink-0 flex items-center gap-1"
                >
                  <Play className="h-4 w-4" />
                  {t.status === 'design_in_progress' ? 'Continue' : 'Start'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
