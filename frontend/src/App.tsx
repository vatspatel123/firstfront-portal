import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, FolderOpen, PlusCircle, Bell, ListChecks, ClipboardCheck,
  BarChart3, Settings as SettingsIcon, Users, CreditCard, TrendingUp,
  MessageCircle, Activity, KanbanSquare, UserPlus, UserCheck, CalendarDays,
  Star, Target, PhoneCall, PieChart
} from 'lucide-react'
import { useAuthStore } from './store/authStore'
import type { UserRole } from './store/authStore'
import Navbar from './components/layout/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import VerifyOTP from './pages/auth/VerifyOTP'
import Dashboard from './pages/shared/Dashboard'
import MyProjects from './pages/client/MyProjects'
import NewProjectWizard from './pages/client/NewProjectWizard'
import ProjectDetail from './pages/client/ProjectDetail'
import Notifications from './pages/shared/Notifications'
import DesignerDayView from './pages/designer/DesignerDayView'
import ProjectWorkspace from './pages/designer/ProjectWorkspace'
import ManagementOverview from './pages/admin/ManagementOverview'
import TeamManagement from './pages/admin/TeamManagement'
import Analytics from './pages/admin/Analytics'
import Billing from './pages/client/Billing'
import Settings from './pages/shared/Settings'
import Messages from './pages/shared/Messages'
import ActivityLog from './pages/shared/ActivityLog'
import ProjectBoard from './pages/admin/ProjectBoard'
import ProjectAssignment from './pages/admin/ProjectAssignment'
import EmployeeDirectory from './pages/admin/EmployeeDirectory'
import LeaveAttendance from './pages/admin/LeaveAttendance'
import PerformanceDocs from './pages/admin/PerformanceDocs'
import CapacityCalendar from './pages/admin/CapacityCalendar'
import NotFound from './pages/shared/NotFound'
import { ErrorBoundary } from './components/ui/ErrorBoundary'

// Lazy-load sales pages (created in Wave 2)
import SalesDashboard from './pages/sales/SalesDashboard'
import LeadDetail from './pages/sales/LeadDetail'
import SalesActivityLog from './pages/sales/SalesActivityLog'
import SalesAnalytics from './pages/sales/SalesAnalytics'

interface NavItem {
  path: string
  label: string
  icon: typeof LayoutDashboard
  roles: UserRole[]
  section?: string
}

const navItems: NavItem[] = [
  // Shared
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['client', 'designer', 'admin', 'sales'] },
  { path: '/messages', label: 'Messages', icon: MessageCircle, roles: ['client', 'designer', 'admin', 'sales'] },
  { path: '/notifications', label: 'Updates', icon: Bell, roles: ['client', 'designer', 'admin', 'sales'] },
  { path: '/activity', label: 'Activity', icon: Activity, roles: ['client', 'designer', 'admin', 'sales'] },

  // Client
  { path: '/new-project', label: 'New Project', icon: PlusCircle, roles: ['client'], section: 'Projects' },
  { path: '/projects', label: 'My Projects', icon: FolderOpen, roles: ['client'] },
  { path: '/billing', label: 'Billing', icon: CreditCard, roles: ['client'] },

  // Designer
  { path: '/designer/tasks', label: 'Today', icon: ListChecks, roles: ['designer'], section: 'Workspace' },
  { path: '/designer/workspace', label: 'Workspace', icon: ClipboardCheck, roles: ['designer'] },

  // Sales
  { path: '/sales', label: 'Pipeline', icon: Target, roles: ['sales'], section: 'Sales CRM' },
  { path: '/sales/activity', label: 'Call Log', icon: PhoneCall, roles: ['sales'] },
  { path: '/sales/analytics', label: 'Sales Analytics', icon: PieChart, roles: ['sales'] },

  // Admin
  { path: '/admin', label: 'Overview', icon: BarChart3, roles: ['admin'], section: 'Management' },
  { path: '/admin/board', label: 'Project Board', icon: KanbanSquare, roles: ['admin'] },
  { path: '/admin/assign', label: 'Assign Projects', icon: UserCheck, roles: ['admin'] },
  { path: '/admin/team', label: 'Team', icon: Users, roles: ['admin'] },
  { path: '/admin/employees', label: 'Employees', icon: UserPlus, roles: ['admin'], section: 'HR' },
  { path: '/admin/leave', label: 'Leave', icon: CalendarDays, roles: ['admin'] },
  { path: '/admin/performance', label: 'Performance', icon: Star, roles: ['admin'] },
  { path: '/admin/capacity', label: 'Capacity', icon: TrendingUp, roles: ['admin'] },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart3, roles: ['admin'] },

  // Settings (all)
  { path: '/settings', label: 'Settings', icon: SettingsIcon, roles: ['client', 'designer', 'admin', 'sales'], section: 'Account' },
]

export default function App() {
  const { user, fetchMe } = useAuthStore()
  const role = (user?.role || 'client') as UserRole
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    if (localStorage.getItem('firstfront-token')) {
      fetchMe()
    }
  }, [])

  const isAuthPage = ['/login', '/signup', '/verify-otp'].includes(location.pathname)

  const filteredNav = navItems.filter(item => item.roles.includes(role))

  const homePath = role === 'client' ? '/' :
    role === 'designer' ? '/designer/tasks' :
    role === 'sales' ? '/sales' : '/admin'

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-surface">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <aside className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-60 bg-white/80 backdrop-blur-xl border-r border-gray-100/60 z-40
          transform transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <nav className="p-3 space-y-0.5 overflow-y-auto h-[calc(100%-3rem)]">
            {filteredNav.map((item, idx) => {
              const isActive = location.pathname === item.path
              const showSection = item.section && (idx === 0 || filteredNav[idx - 1]?.section !== item.section)
              return (
                <div key={item.path}>
                  {showSection && (
                    <div className={`px-3 pt-5 pb-1.5 ${idx === 0 ? 'pt-1' : ''}`}>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">
                        {item.section}
                      </span>
                    </div>
                  )}
                  <Link to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-brand-50 text-brand-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}>
                    <item.icon className={`h-[18px] w-[18px] transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} />
                    {item.label}
                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />}
                  </Link>
                </div>
              )
            })}
          </nav>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden animate-fade-in-fast" onClick={() => setSidebarOpen(false)} />
        )}

        <main className="flex-1 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
          <ErrorBoundary>
            <div className="animate-fade-in">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/new-project" element={role === 'client' ? <NewProjectWizard /> : <Navigate to={homePath} />} />
                <Route path="/projects" element={role === 'client' ? <MyProjects /> : <Navigate to={homePath} />} />
                <Route path="/projects/:id" element={role === 'client' ? <ProjectDetail /> : <Navigate to={homePath} />} />
                <Route path="/billing" element={role === 'client' ? <Billing /> : <Navigate to={homePath} />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/activity" element={<ActivityLog />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/designer/tasks" element={role === 'designer' ? <DesignerDayView /> : <Navigate to={homePath} />} />
                <Route path="/designer/workspace" element={role === 'designer' ? <ProjectWorkspace /> : <Navigate to={homePath} />} />
                <Route path="/sales" element={role === 'sales' ? <SalesDashboard /> : <Navigate to={homePath} />} />
                <Route path="/sales/leads/:id" element={role === 'sales' ? <LeadDetail /> : <Navigate to={homePath} />} />
                <Route path="/sales/activity" element={role === 'sales' ? <SalesActivityLog /> : <Navigate to={homePath} />} />
                <Route path="/sales/analytics" element={role === 'sales' ? <SalesAnalytics /> : <Navigate to={homePath} />} />
                <Route path="/admin" element={role === 'admin' ? <ManagementOverview /> : <Navigate to={homePath} />} />
                <Route path="/admin/board" element={role === 'admin' ? <ProjectBoard /> : <Navigate to={homePath} />} />
                <Route path="/admin/assign" element={role === 'admin' ? <ProjectAssignment /> : <Navigate to={homePath} />} />
                <Route path="/admin/team" element={role === 'admin' ? <TeamManagement /> : <Navigate to={homePath} />} />
                <Route path="/admin/employees" element={role === 'admin' ? <EmployeeDirectory /> : <Navigate to={homePath} />} />
                <Route path="/admin/leave" element={role === 'admin' ? <LeaveAttendance /> : <Navigate to={homePath} />} />
                <Route path="/admin/performance" element={role === 'admin' ? <PerformanceDocs /> : <Navigate to={homePath} />} />
                <Route path="/admin/capacity" element={role === 'admin' ? <CapacityCalendar /> : <Navigate to={homePath} />} />
                <Route path="/admin/analytics" element={role === 'admin' ? <Analytics /> : <Navigate to={homePath} />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </ErrorBoundary>
        </main>
      </div>
      </div>
    </ProtectedRoute>
  )
}
