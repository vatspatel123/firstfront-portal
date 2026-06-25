import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users } from 'lucide-react'
import { useProjectStore, useEmployeeStore } from '../../store/useApiStores'

const statusStyles: Record<string, string> = {
  completed: 'bg-green-100 text-green-700 border-green-200',
  'on-track': 'bg-blue-50 text-blue-600 border-blue-200',
  'at-risk': 'bg-red-100 text-red-700 border-red-200',
}

export default function CapacityCalendar() {
  const { projects, loading: projectsLoading, fetchProjects } = useProjectStore()
  const { employees, loading: employeesLoading, fetchEmployees } = useEmployeeStore()
  const [view, setView] = useState<'month' | 'week'>('month')
  const [refDate, setRefDate] = useState(new Date())

  useEffect(() => {
    fetchProjects()
    fetchEmployees()
  }, [])

  const deadlines = projects.map(p => {
    const d = new Date(p.created_at)
    d.setDate(d.getDate() + 7)
    const dateStr = d.toISOString().split('T')[0]

    let status = 'on-track'
    if (p.status === 'delivered' || p.status === 'approved') {
      status = 'completed'
    } else if (p.status === 'missing_data' || d < new Date()) {
      status = 'at-risk'
    }

    return {
      id: p.id,
      project: p.name,
      date: dateStr,
      status,
      designer: p.designer_name || 'Unassigned',
      designer_id: p.assigned_to,
    }
  })

  const byDate = deadlines.reduce((acc, d) => {
    if (!acc[d.date]) acc[d.date] = []
    acc[d.date].push(d)
    return acc
  }, {} as Record<string, typeof deadlines>)

  const year = refDate.getFullYear()
  const month = refDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = refDate.toLocaleDateString('en', { month: 'long', year: 'numeric' })

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let i = 1; i <= daysInMonth; i++) cells.push(i)
  while (cells.length % 7 !== 0) cells.push(null)

  const cellDate = (day: number) => {
    const mm = String(month + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    return `${year}-${mm}-${dd}`
  }

  const designers = employees.filter(e => e.department?.toLowerCase() === 'design')
  const designerLoad = designers.map(d => {
    const activeDeadlines = deadlines.filter(c => c.designer_id === d.user_id && c.status !== 'completed').length
    return { ...d, load: activeDeadlines, pct: Math.min(100, activeDeadlines * 25) }
  }).sort((a, b) => b.load - a.load)

  const today = new Date()

  if (projectsLoading || employeesLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Capacity & Deadlines</h1>
          <p className="text-sm text-slate-500 mt-1">Team workload and project deadline calendar</p>
        </div>
        <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-0.5">
          {(['month', 'week'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                view === v ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700'
              }`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-blue-600" />
              {monthName}
            </h2>
            <div className="flex gap-1">
              <button onClick={() => { const d = new Date(refDate); d.setMonth(d.getMonth() - 1); setRefDate(d) }}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><ChevronLeft className="h-4 w-4 text-slate-500" /></button>
              <button onClick={() => { const d = new Date(refDate); d.setMonth(d.getMonth() + 1); setRefDate(d) }}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><ChevronRight className="h-4 w-4 text-slate-500" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-[10px] uppercase tracking-wider text-slate-400 font-medium py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) return <div key={i} className="aspect-square" />
              const dateKey = cellDate(day)
              const dateDeadlines = byDate[dateKey] || []
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

              return (
                <div key={i} className={`aspect-square border rounded-xl p-1.5 flex flex-col ${
                  isToday ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:bg-slate-50'
                } transition-colors`}>
                  <span className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-slate-600'}`}>{day}</span>
                  <div className="flex-1 space-y-0.5 mt-0.5 overflow-hidden">
                    {dateDeadlines.slice(0, 2).map(d => (
                      <div key={d.id} className={`text-[9px] px-1 py-0.5 rounded border ${statusStyles[d.status]} truncate font-medium`}>
                        {d.project}
                      </div>
                    ))}
                    {dateDeadlines.length > 2 && (
                      <div className="text-[9px] text-slate-400">+{dateDeadlines.length - 2}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-green-500" /> Completed</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-500" /> On Track</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-500" /> At Risk</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-6">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-blue-600" /> Designer Workload
          </h2>
          <p className="text-xs text-slate-500 mb-4">Active deadlines per designer this month</p>
          <div className="space-y-3">
            {designerLoad.map(d => (
              <div key={d.id}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{d.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{d.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{d.load}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 ml-9">
                  <div className={`h-1.5 rounded-full transition-all ${d.pct > 75 ? 'bg-red-500' : d.pct > 50 ? 'bg-amber-500' : 'bg-green-500'}`}
                    style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
            {designerLoad.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-4">No designers yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Upcoming Deadlines</h2>
          <span className="text-xs text-slate-400">Sorted by date</span>
        </div>
        <div className="divide-y divide-slate-100">
          {deadlines
            .filter(d => d.status !== 'completed')
            .sort((a, b) => a.date.localeCompare(b.date))
            .map(d => {
              const s = statusStyles[d.status]
              const initials = d.designer !== 'Unassigned'
                ? d.designer.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                : ''

              return (
                <div key={d.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className="text-center shrink-0 w-12">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">{new Date(d.date).toLocaleDateString('en', { month: 'short' })}</p>
                    <p className="text-xl font-bold text-slate-900 leading-none">{new Date(d.date).getDate()}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm">{d.project}</p>
                    <p className="text-xs text-slate-400">{d.date}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {d.designer !== 'Unassigned' ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">{initials}</div>
                        <span className="text-xs text-slate-500 hidden sm:block">{d.designer.split(' ')[0]}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-amber-600">Unassigned</span>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${s}`}>{d.status}</span>
                  </div>
                </div>
              )
            })}
          {deadlines.filter(d => d.status !== 'completed').length === 0 && (
            <div className="px-5 py-8 text-center text-slate-400">No upcoming deadlines</div>
          )}
        </div>
      </div>
    </div>
  )
}
