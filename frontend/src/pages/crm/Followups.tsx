import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../../utils/api'
import { CalendarCheck, ArrowRight, Clock } from 'lucide-react'

export default function Followups() {
  const [followups, setFollowups] = useState<any[]>([])
  const [leads, setLeads] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [fuRes, leadsRes] = await Promise.all([
          API.get('/api/leads/followups/today'),
          API.get('/api/leads/')
        ])
        const fuData = Array.isArray(fuRes.data) ? fuRes.data : []
        setFollowups(fuData)
        const leadMap: Record<string, any> = {}
        const leadsData = Array.isArray(leadsRes.data) ? leadsRes.data : []
        leadsData.forEach((l: any) => { leadMap[l.id] = l })
        setLeads(leadMap)
      } catch (err) {
        console.error('Failed to load followups', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Today's Follow-ups</h1>
        <p className="text-slate-500 mt-1">{followups.length} follow-up{followups.length !== 1 ? 's' : ''} due today</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
        {followups.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarCheck className="h-12 w-12 mx-auto mb-3 text-slate-200" />
            <h3 className="font-medium text-slate-900">No follow-ups today</h3>
            <p className="text-sm text-slate-500 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {followups.map((fu: any) => {
              const lead = leads[fu.lead_id]
              return (
                <Link
                  key={fu.id}
                  to={`/sales/leads/${fu.lead_id}`}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition-all"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{lead?.name || 'Unknown Lead'}</p>
                    <p className="text-sm text-slate-500">{lead?.company || ''}</p>
                    <p className="text-sm text-slate-600 mt-1">{fu.note}</p>
                    {fu.next_followup_date && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600">
                        <Clock className="h-3 w-3" />
                        Due: {new Date(fu.next_followup_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      fu.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {fu.status}
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-300" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
