import { Users, Clock, MoreVertical, TrendingUp } from 'lucide-react'

const designers = [
  { id: 'd1', name: 'Priya Sharma', role: 'Senior Designer', avatar: 'PS', active: 5, completed: 23, capacity: 80, status: 'available' },
  { id: 'd2', name: 'Vikram Singh', role: 'Designer', avatar: 'VS', active: 7, completed: 18, capacity: 100, status: 'busy' },
  { id: 'd3', name: 'Ananya Iyer', role: 'Junior Designer', avatar: 'AI', active: 3, completed: 12, capacity: 60, status: 'available' },
  { id: 'd4', name: 'Rohan Mehta', role: 'Designer', avatar: 'RM', active: 4, completed: 15, capacity: 75, status: 'available' },
  { id: 'd5', name: 'Sneha Reddy', role: 'Senior Designer', avatar: 'SR', active: 6, completed: 28, capacity: 95, status: 'busy' },
  { id: 'd6', name: 'Karthik Patel', role: 'Designer', avatar: 'KP', active: 2, completed: 9, capacity: 45, status: 'available' },
]

const statusStyles = {
  available: { bg: 'bg-success-bg', text: 'text-success', dot: 'bg-success', label: 'Available' },
  busy: { bg: 'bg-warning-bg', text: 'text-warning', dot: 'bg-warning', label: 'At capacity' },
}

export default function TeamManagement() {
  const totalActive = designers.reduce((sum, d) => sum + d.active, 0)
  const avgUtilization = Math.round(designers.reduce((sum, d) => sum + d.capacity, 0) / designers.length)

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Team & Designer Management</h1>
        <p className="text-gray-500 mt-1">Monitor workload and assign projects</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-brand-500" />
            </div>
          </div>
          <p className="text-2xl font-bold font-display text-ink">{designers.length}</p>
          <p className="text-sm text-gray-500">Total Designers</p>
        </div>
        <div className="card p-5">
          <div className="w-10 h-10 rounded-lg bg-sun-100 flex items-center justify-center mb-2">
            <Clock className="h-5 w-5 text-sun-700" />
          </div>
          <p className="text-2xl font-bold font-display text-ink">{totalActive}</p>
          <p className="text-sm text-gray-500">Active Projects</p>
        </div>
        <div className="card p-5">
          <div className="w-10 h-10 rounded-lg bg-success-bg flex items-center justify-center mb-2">
            <TrendingUp className="h-5 w-5 text-success" />
          </div>
          <p className="text-2xl font-bold font-display text-ink">{avgUtilization}%</p>
          <p className="text-sm text-gray-500">Avg. Utilization</p>
        </div>
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-display font-semibold text-ink">Design Team</h2>
          <button className="btn-primary text-sm">+ Add Designer</button>
        </div>
        <div className="divide-y divide-gray-50">
          {designers.map((d) => {
            const s = statusStyles[d.status as keyof typeof statusStyles]
            return (
              <div key={d.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {d.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ink text-sm">{d.name}</p>
                    <span className={`status-pill ${s.bg} ${s.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} mr-1.5`} />{s.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{d.role}</p>
                </div>
                <div className="hidden sm:flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-ink">{d.active}</p>
                    <p className="text-xs text-gray-400">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-success">{d.completed}</p>
                    <p className="text-xs text-gray-400">Done</p>
                  </div>
                  <div className="w-24">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">Capacity</span>
                      <span className="font-medium text-ink">{d.capacity}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${d.capacity > 90 ? 'bg-error' : d.capacity > 70 ? 'bg-warning' : 'bg-success'}`}
                        style={{ width: `${d.capacity}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="btn-ghost text-sm !px-3 !py-1.5">Assign</button>
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
