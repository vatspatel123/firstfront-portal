import { useState, useEffect } from 'react'
import { Check, X, Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLeaveStore } from '../../store/useApiStores'

const statusStyles: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700' },
  approved: { bg: 'bg-green-100', text: 'text-green-700' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700' },
}

export default function LeaveAttendance() {
  const { leaves: requests, loading, fetchLeaves, approveLeave, rejectLeave } = useLeaveStore()
  const [tab, setTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  useEffect(() => { fetchLeaves() }, [fetchLeaves])

  if (loading) return (
    <div className="flex justify-center p-8">
      <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
    </div>
  )

  const filtered = requests.filter(r => tab === 'all' || r.status === tab)

  const approve = (id: string) => {
    approveLeave(id)
    toast.success('Leave approved')
  }
  const reject = (id: string) => {
    rejectLeave(id)
    toast.error('Leave rejected')
  }

  const counts = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  }

  const today = new Date()
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - today.getDay() + i)
    return d
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Leave & Attendance</h1>
        <p className="text-gray-500 mt-1">Manage time-off requests and view team attendance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-500">Pending</p>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{counts.pending}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-500">Approved (this month)</p>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{counts.approved}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-500">On Leave Today</p>
            <CalendarIcon className="h-4 w-4 text-primary-500" />
          </div>
          <p className="text-2xl font-bold text-primary-600">
            {requests.filter(r => {
              const from = new Date(r.from_date)
              const to = new Date(r.to_date)
              return today >= from && today <= to && r.status === 'approved'
            }).length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold text-gray-900 mb-3">This Week</h2>
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((d, i) => {
            const isToday = d.toDateString() === today.toDateString()
            const dayName = d.toLocaleDateString('en', { weekday: 'short' })
            const onLeaveCount = requests.filter(r => {
              const from = new Date(r.from_date)
              const to = new Date(r.to_date)
              return d >= from && d <= to && r.status === 'approved'
            }).length
            return (
              <div key={i} className={`rounded-lg p-2 text-center ${isToday ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'}`}>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">{dayName}</p>
                <p className={`text-lg font-semibold ${isToday ? 'text-primary-600' : 'text-gray-900'}`}>{d.getDate()}</p>
                {onLeaveCount > 0 ? (
                  <p className="text-[10px] text-amber-600 mt-1">{onLeaveCount} on leave</p>
                ) : (
                  <p className="text-[10px] text-gray-300 mt-1">—</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <div className="flex gap-1 border-b border-gray-100 mb-3">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
                tab === t ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t} {t !== 'all' && `(${counts[t]})`}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center text-gray-400">No {tab} requests.</div>
          ) : (
            filtered.map(r => {
              const s = statusStyles[r.status] || statusStyles.pending
              return (
                <div key={r.id} className="bg-white rounded-xl border p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {r.employee_name?.split(' ').map(n => n[0]).join('') || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-900 text-sm">{r.employee_name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.bg} ${s.text}`}>{r.status}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{r.type} · {r.from_date?.slice(0,10)} → {r.to_date?.slice(0,10)} · {r.days} day(s)</p>
                      <p className="text-xs text-gray-400 mt-1 italic">"{r.reason}"</p>
                    </div>
                    {r.status === 'pending' && (
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => approve(r.id)} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-colors" title="Approve">
                          <Check className="h-4 w-4" />
                        </button>
                        <button onClick={() => reject(r.id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors" title="Reject">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
