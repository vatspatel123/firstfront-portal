import { ArrowRight, Clock, AlertTriangle } from 'lucide-react'
import { MOCK_DESIGNER_TASKS } from '../../utils/mockData'

const priorityColors: Record<string, string> = {
  high: 'bg-error-bg text-error',
  medium: 'bg-warning-bg text-warning',
  low: 'bg-gray-100 text-gray-600',
}

export default function DesignerDayView() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Today's Tasks</h1>
        <p className="text-gray-500 mt-1">{MOCK_DESIGNER_TASKS.length} tasks to complete</p>
      </div>

      {MOCK_DESIGNER_TASKS.length === 0 ? (
        <div className="card p-12 text-center">
          <Clock className="h-12 w-12 text-gray-200 mx-auto mb-3" />
          <h3 className="font-display font-medium text-ink">No tasks assigned</h3>
          <p className="text-sm text-gray-500 mt-1">Take a break — you're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {MOCK_DESIGNER_TASKS.map((t) => (
            <div key={t.id} className="card-hover p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-display font-medium text-ink">{t.project}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[t.priority]}`}>{t.priority}</span>
                  </div>
                  <p className="text-sm text-gray-500">{t.task}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>Client: {t.client}</span>
                    {t.deadline === 'Today' && <span className="flex items-center gap-1 text-warning"><AlertTriangle className="h-3 w-3" /> Due today</span>}
                  </div>
                </div>
                <button className="btn-primary text-sm !py-2 !px-5 shrink-0">
                  {t.deadline === 'Today' ? 'Start Now' : 'Continue'}
                  <ArrowRight className="h-4 w-4 ml-1 inline" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
