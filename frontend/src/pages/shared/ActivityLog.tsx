import { Activity, FileText, Sun, Camera, CheckCircle, Upload, Download, MessageCircle } from 'lucide-react'

const activities = [
  { id: '1', type: 'upload', user: 'Priya Sharma', action: 'uploaded', target: 'shadow-analysis-report.pdf', project: 'Shanti Niketan Roof', time: '2 hours ago', icon: Upload, color: 'bg-brand-50 text-brand-500' },
  { id: '2', type: 'message', user: 'Priya Sharma', action: 'sent a message', target: 'regarding tilt angle', project: 'Shanti Niketan Roof', time: '1 hour ago', icon: MessageCircle, color: 'bg-sun-100 text-sun-700' },
  { id: '3', type: 'status', user: 'System', action: 'moved to', target: 'In Design stage', project: 'GreenTech Office Complex', time: '3 hours ago', icon: Sun, color: 'bg-purple-50 text-purple-600' },
  { id: '4', type: 'file', user: 'Rajesh Patel', action: 'uploaded', target: 'site-photo-3.jpg', project: 'Shanti Niketan Roof', time: '5 hours ago', icon: Camera, color: 'bg-brand-50 text-brand-500' },
  { id: '5', type: 'complete', user: 'Vikram Singh', action: 'completed', target: 'CEIG drawing', project: 'Sunrise Factory Roof', time: '1 day ago', icon: CheckCircle, color: 'bg-success-bg text-success' },
  { id: '6', type: 'download', user: 'Amit Verma', action: 'downloaded', target: 'final-approval.pdf', project: 'Sunrise Factory Roof', time: '1 day ago', icon: Download, color: 'bg-gray-100 text-gray-600' },
  { id: '7', type: 'upload', user: 'Rajesh Patel', action: 'uploaded', target: 'site-plan.pdf', project: 'GreenTech Office Complex', time: '2 days ago', icon: FileText, color: 'bg-brand-50 text-brand-500' },
  { id: '8', type: 'complete', user: 'Sneha Reddy', action: 'completed', target: '3D layout design', project: 'Lake View Villa', time: '3 days ago', icon: CheckCircle, color: 'bg-success-bg text-success' },
]

const filterTabs = ['All', 'Uploads', 'Status', 'Messages', 'Completions']

export default function ActivityLog() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Activity Log</h1>
        <p className="text-gray-500 mt-1">A complete history of all platform activity</p>
      </div>

      <div className="flex gap-1 border-b border-gray-100 overflow-x-auto">
        {filterTabs.map((tab, i) => (
          <button key={tab}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              i === 0 ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-medium text-gray-500">Today</h2>
        </div>
        {activities.slice(0, 4).map((a) => {
          const Icon = a.icon
          return (
            <div key={a.id} className="card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${a.color} flex items-center justify-center shrink-0`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink">
                  <span className="font-medium">{a.user}</span> {a.action} <span className="font-medium">{a.target}</span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{a.project} · {a.time}</p>
              </div>
            </div>
          )
        })}

        <div className="flex items-center gap-2 mt-6 mb-2">
          <h2 className="text-sm font-medium text-gray-500">Earlier this week</h2>
        </div>
        {activities.slice(4).map((a) => {
          const Icon = a.icon
          return (
            <div key={a.id} className="card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${a.color} flex items-center justify-center shrink-0`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink">
                  <span className="font-medium">{a.user}</span> {a.action} <span className="font-medium">{a.target}</span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{a.project} · {a.time}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
