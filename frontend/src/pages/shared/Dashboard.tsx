import { useEffect } from 'react'
import { Sun, FolderOpen, ArrowRight, TrendingUp, Plus, Clock, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useProjectStore } from '../../store/useApiStores'
import { PROJECT_STATUS_MAP } from '../../utils/constants'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function ClientDashboard() {
  const { user } = useAuthStore()
  const { projects, fetchProjects, loading } = useProjectStore()

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const activeProjects = projects.filter(p => p.status !== 'delivered')
  const inDesign = projects.filter(p => p.status === 'design_in_progress')
  const delivered = projects.filter(p => p.status === 'delivered')
  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">{getGreeting()}, {firstName}!</h1>
          <p className="page-subtitle">
            {activeProjects.length > 0
              ? `You have ${activeProjects.length} active project${activeProjects.length > 1 ? 's' : ''}.`
              : 'Start your first solar project today.'}
          </p>
        </div>
        <Link to="/new-project" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Project
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Active Projects', value: activeProjects.length, icon: FolderOpen, color: 'text-brand-500', bg: 'bg-brand-50' },
          { label: 'In Progress', value: inDesign.length, icon: TrendingUp, color: 'text-sun-600', bg: 'bg-sun-50' },
          { label: 'Delivered', value: delivered.length, icon: Sun, color: 'text-success', bg: 'bg-success-bg' },
        ].map((s, idx) => (
          <div key={s.label} className="stat-card animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold font-display text-ink animate-count-up">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Projects List */}
      <div>
        <h2 className="section-header mb-4">Your Projects</h2>
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><FolderOpen className="h-8 w-8 text-gray-300" /></div>
            <p className="text-gray-500 mb-1 font-medium">No projects yet</p>
            <p className="text-sm text-gray-400 mb-4">Create your first solar design project to get started.</p>
            <Link to="/new-project" className="btn-primary">Start a Project</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map((p, idx) => {
              const status = PROJECT_STATUS_MAP[p.status] || { label: p.status, color: 'text-gray-600', bgColor: 'bg-gray-100' }
              return (
                <Link key={p.id} to={`/projects/${p.id}`}
                  className="card-hover p-4 flex items-center justify-between block animate-slide-up"
                  style={{ animationDelay: `${idx * 60}ms` }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-medium text-ink truncate">{p.name}</p>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{p.services_required} · {p.location}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="text-xs text-gray-400 hidden sm:block">{p.capacity} kW</span>
                    <span className={`status-pill ${status.bgColor} ${status.color}`}>{status.label}</span>
                    <ArrowRight className="h-4 w-4 text-gray-300" />
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

function DesignerDashboard() {
  const { user } = useAuthStore()
  const { projects, fetchProjects, loading } = useProjectStore()

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const inDesign = projects.filter(p => p.status === 'design_in_progress')
  const assigned = projects.filter(p => p.status === 'assigned')
  const completed = projects.filter(p => p.status === 'delivered')
  const firstName = user?.name?.split(' ')[0] || 'Designer'

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="page-title">{getGreeting()}, {firstName}!</h1>
        <p className="page-subtitle">You have {inDesign.length + assigned.length} projects assigned to you</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'In Design', value: inDesign.length, icon: TrendingUp, color: 'text-sun-600', bg: 'bg-sun-50' },
          { label: 'Assigned', value: assigned.length, icon: Clock, color: 'text-brand-500', bg: 'bg-brand-50' },
          { label: 'Completed', value: completed.length, icon: CheckCircle2, color: 'text-success', bg: 'bg-success-bg' },
        ].map((s, idx) => (
          <div key={s.label} className="stat-card animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold font-display text-ink">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="section-header mb-4">Your Projects</h2>
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
        ) : inDesign.concat(assigned).length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><FolderOpen className="h-8 w-8 text-gray-300" /></div>
            <p className="text-gray-500">No projects assigned yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {inDesign.concat(assigned).map((p, idx) => {
              const status = PROJECT_STATUS_MAP[p.status] || { label: p.status, color: 'text-gray-600', bgColor: 'bg-gray-100' }
              return (
                <div key={p.id} className="card-hover p-4 flex items-center justify-between animate-slide-up"
                  style={{ animationDelay: `${idx * 60}ms` }}>
                  <div className="flex-1">
                    <p className="font-medium text-ink">{p.name}</p>
                    <p className="text-sm text-gray-500">{p.services_required} · {p.location}</p>
                  </div>
                  <span className={`status-pill ${status.bgColor} ${status.color}`}>{status.label}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function AdminDashboard() {
  const { user } = useAuthStore()
  const { projects, fetchProjects, loading } = useProjectStore()

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const activeProjects = projects.filter(p => p.status !== 'delivered')
  const needsAttention = projects.filter(p => p.status === 'new' || p.status === 'missing_data')
  const firstName = user?.name?.split(' ')[0] || 'Admin'

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="page-title">{getGreeting()}, {firstName}!</h1>
        <p className="page-subtitle">
          {needsAttention.length > 0
            ? `${needsAttention.length} items need your attention`
            : 'Everything is on track'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Projects', value: projects.length, icon: FolderOpen, color: 'text-brand-500', bg: 'bg-brand-50' },
          { label: 'Active', value: activeProjects.length, icon: TrendingUp, color: 'text-sun-600', bg: 'bg-sun-50' },
          { label: 'Needs Attention', value: needsAttention.length, icon: Clock, color: 'text-error', bg: 'bg-error-bg' },
        ].map((s, idx) => (
          <div key={s.label} className="stat-card animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold font-display text-ink">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="section-header text-base">All Projects</h2>
          <Link to="/admin/board" className="text-xs font-medium text-brand-500 hover:text-brand-600 transition-colors">
            View Board →
          </Link>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {projects.map((p, idx) => {
              const status = PROJECT_STATUS_MAP[p.status] || { label: p.status, color: 'text-gray-600', bgColor: 'bg-gray-100' }
              return (
                <div key={p.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${idx * 40}ms` }}>
                  <div className="flex-1">
                    <p className="font-medium text-ink text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.project_type} · {p.location}</p>
                  </div>
                  <span className={`status-pill ${status.bgColor} ${status.color}`}>{status.label}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function SalesDashboard() {
  const { user } = useAuthStore()
  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="page-title">{getGreeting()}, {firstName}!</h1>
        <p className="page-subtitle">Head to your sales pipeline to manage leads.</p>
      </div>
      <div className="card p-8 text-center">
        <Link to="/sales" className="btn-primary">Go to Sales Pipeline</Link>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const role = user?.role || 'client'

  if (role === 'designer') return <DesignerDashboard />
  if (role === 'admin') return <AdminDashboard />
  if (role === 'sales') return <SalesDashboard />
  return <ClientDashboard />
}
