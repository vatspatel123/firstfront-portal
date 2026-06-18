import { TrendingUp, TrendingDown, Calendar, Briefcase, Users, DollarSign } from 'lucide-react'

const monthlyData = [
  { month: 'Jun', projects: 14, revenue: 4.2 },
  { month: 'Jul', projects: 18, revenue: 5.8 },
  { month: 'Aug', projects: 16, revenue: 5.1 },
  { month: 'Sep', projects: 22, revenue: 7.4 },
  { month: 'Oct', projects: 20, revenue: 6.8 },
  { month: 'Nov', projects: 24, revenue: 12.5 },
]

const serviceBreakdown = [
  { name: 'Pre-Plan Design', count: 38, pct: 45, color: 'bg-brand-500' },
  { name: 'Detailed Design', count: 22, pct: 26, color: 'bg-sun-500' },
  { name: 'CEIG Drawing', count: 14, pct: 17, color: 'bg-success' },
  { name: 'Shadow Analysis', count: 10, pct: 12, color: 'bg-purple-500' },
]

const kpiCards = [
  { label: 'Total Revenue (6 mo)', value: '₹41.8L', change: '+18%', up: true, icon: DollarSign },
  { label: 'Total Projects', value: '114', change: '+12%', up: true, icon: Briefcase },
  { label: 'Active Clients', value: '47', change: '+5%', up: true, icon: Users },
  { label: 'Avg. Turnaround', value: '4.2 days', change: '-8%', up: false, icon: Calendar },
]

const maxProjects = Math.max(...monthlyData.map(d => d.projects))
const maxRevenue = Math.max(...monthlyData.map(d => d.revenue))

export default function Analytics() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Analytics & Reports</h1>
        <p className="text-gray-500 mt-1">Insights into your solar design operations</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((k) => (
          <div key={k.label} className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center">
                <k.icon className="h-4 w-4 text-brand-500" />
              </div>
              <span className={`text-xs font-medium flex items-center gap-0.5 ${k.up ? 'text-success' : 'text-error'}`}>
                {k.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {k.change}
              </span>
            </div>
            <p className="text-2xl font-bold font-display text-ink">{k.value}</p>
            <p className="text-xs text-gray-500">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-semibold text-ink">Monthly Trends</h2>
              <p className="text-xs text-gray-500 mt-0.5">Projects & revenue over the last 6 months</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-brand-500" />
                <span className="text-gray-500">Projects</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-sun-500" />
                <span className="text-gray-500">Revenue (₹L)</span>
              </div>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2 h-48">
            {monthlyData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center justify-end gap-1">
                <div className="w-full flex items-end justify-center gap-1 h-full">
                  <div
                    className="w-3/7 bg-brand-500 rounded-t transition-all hover:opacity-80"
                    style={{ height: `${(d.projects / maxProjects) * 100}%`, minHeight: '4px' }}
                  />
                  <div
                    className="w-3/7 bg-sun-500 rounded-t transition-all hover:opacity-80"
                    style={{ height: `${(d.revenue / maxRevenue) * 100}%`, minHeight: '4px' }}
                  />
                </div>
                <span className="text-xs text-gray-500 mt-1">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-display font-semibold text-ink mb-1">Service Mix</h2>
          <p className="text-xs text-gray-500 mb-5">Breakdown by service type</p>
          <div className="space-y-4">
            {serviceBreakdown.map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-ink font-medium">{s.name}</span>
                  <span className="text-gray-500">{s.count} <span className="text-gray-300">({s.pct}%)</span></span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className={`h-2 rounded-full ${s.color} transition-all`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-display font-semibold text-ink mb-4">Top Performing Designers</h2>
        <div className="space-y-3">
          {[
            { name: 'Sneha Reddy', completed: 28, rating: 4.9, avatar: 'SR' },
            { name: 'Priya Sharma', completed: 23, rating: 4.8, avatar: 'PS' },
            { name: 'Vikram Singh', completed: 18, rating: 4.7, avatar: 'VS' },
          ].map((d, i) => (
            <div key={d.name} className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="w-6 text-center text-sm font-bold text-gray-400">#{i + 1}</span>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-[10px] font-bold flex items-center justify-center">{d.avatar}</div>
              <div className="flex-1">
                <p className="font-medium text-ink text-sm">{d.name}</p>
                <p className="text-xs text-gray-400">{d.completed} projects completed</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-ink">⭐ {d.rating}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
