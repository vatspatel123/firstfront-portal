import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Calendar, Briefcase, Users } from 'lucide-react'
import api from '../../services/api'

export default function Analytics() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalLeads: 0,
    deliveredProjects: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, leadsRes] = await Promise.all([
          api.get('/projects/'),
          api.get('/leads/')
        ])
        const projects = projectsRes.data
        setStats({
          totalProjects: projects.length,
          activeProjects: projects.filter((p: any) => !['delivered', 'new'].includes(p.status)).length,
          totalLeads: leadsRes.data.length,
          deliveredProjects: projects.filter((p: any) => p.status === 'delivered').length
        })
      } catch (err) {
        console.error('Failed to load analytics', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  const kpiCards = [
    { label: 'Total Projects', value: stats.totalProjects.toString(), change: '+12%', up: true, icon: Briefcase },
    { label: 'Active Projects', value: stats.activeProjects.toString(), change: '+5%', up: true, icon: TrendingUp },
    { label: 'Total Leads', value: stats.totalLeads.toString(), change: '+8%', up: true, icon: Users },
    { label: 'Completed', value: stats.deliveredProjects.toString(), change: '+15%', up: true, icon: Calendar },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-500 mt-1">Insights into your solar design operations</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((k) => (
          <div key={k.label} className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
                <k.icon className="h-4 w-4 text-primary-600" />
              </div>
              <span className={`text-xs font-medium flex items-center gap-0.5 ${k.up ? 'text-green-600' : 'text-red-600'}`}>
                {k.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {k.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{k.value}</p>
            <p className="text-xs text-gray-500">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Project Status Distribution</h2>
          <div className="space-y-3">
            {[
              { label: 'New', count: stats.totalProjects - stats.activeProjects - stats.deliveredProjects, color: 'bg-blue-500' },
              { label: 'Active', count: stats.activeProjects, color: 'bg-amber-500' },
              { label: 'Completed', count: stats.deliveredProjects, color: 'bg-green-500' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">{item.label}</span>
                  <span className="text-gray-500">{item.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: stats.totalProjects > 0 ? `${(item.count / stats.totalProjects) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Conversion Rate</span>
              <span className="font-semibold text-gray-900">
                {stats.totalLeads > 0 ? Math.round((stats.totalProjects / stats.totalLeads) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <span className="font-semibold text-gray-900">
                {stats.totalProjects > 0 ? Math.round((stats.deliveredProjects / stats.totalProjects) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Active Pipeline</span>
              <span className="font-semibold text-gray-900">{stats.activeProjects} projects</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
