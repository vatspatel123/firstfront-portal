import { useEffect, useState } from 'react'
import API from '../../utils/api'
import { Users, Briefcase, CalendarCheck, TrendingUp } from 'lucide-react'

export default function CrmDashboard() {
  const [stats, setStats] = useState({ leads: 0, projects: 0, followups: 0, active: 0 })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leadsRes, projectsRes] = await Promise.all([
          API.get('/api/leads/'),
          API.get('/api/projects/')
        ])
        setStats({
          leads: leadsRes.data.length,
          projects: projectsRes.data.length,
          followups: 0,
          active: projectsRes.data.filter((p: any) => !['delivered', 'new'].includes(p.status)).length
        })
      } catch (err) {
        console.error('Failed to load dashboard', err)
      }
    }
    fetchData()
  }, [])

  const cards = [
    { label: 'Total Leads', value: stats.leads, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Projects', value: stats.projects, icon: Briefcase, color: 'text-primary-600', bg: 'bg-primary-100' },
    { label: 'Active Projects', value: stats.active, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Pending Follow-ups', value: stats.followups, icon: CalendarCheck, color: 'text-solar-600', bg: 'bg-solar-100' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">CRM Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${card.bg}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
