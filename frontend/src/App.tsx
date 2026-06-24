import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import { useEffect } from 'react'

import AdminLayout from './components/layouts/AdminLayout'
import SalesLayout from './components/layouts/SalesLayout'
import DesignerLayout from './components/layouts/DesignerLayout'
import PortalLayout from './components/layouts/PortalLayout'

import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import VerifyOTP from './pages/auth/VerifyOTP'

import AdminDashboard from './pages/admin/ManagementOverview'
import ProjectBoard from './pages/admin/ProjectBoard'
import TeamManagement from './pages/admin/TeamManagement'
import EmployeeDirectory from './pages/admin/EmployeeDirectory'
import Analytics from './pages/admin/Analytics'
import CapacityCalendar from './pages/admin/CapacityCalendar'
import PerformanceDocs from './pages/admin/PerformanceDocs'
import ProjectAssignment from './pages/admin/ProjectAssignment'
import LeaveAttendance from './pages/admin/LeaveAttendance'

import SalesDashboard from './pages/sales/SalesDashboard'
import SalesLeads from './pages/crm/Leads'
import SalesLeadDetail from './pages/sales/LeadDetail'
import SalesProjects from './pages/crm/Projects'
import SalesFollowups from './pages/crm/Followups'
import SalesAnalytics from './pages/sales/SalesAnalytics'
import SalesActivityLog from './pages/sales/SalesActivityLog'

import DesignerDayView from './pages/designer/DesignerDayView'
import DesignerProjects from './pages/crm/Projects'
import DesignerMessages from './pages/shared/Messages'
import ProjectWorkspace from './pages/designer/ProjectWorkspace'

import PortalDashboard from './pages/portal/Dashboard'
import NewProjectWizard from './pages/client/NewProjectWizard'
import ProjectDetail from './pages/portal/ProjectDetail'
import ProjectHistory from './pages/portal/ProjectHistory'
import Billing from './pages/client/Billing'
import ClientMyProjects from './pages/client/MyProjects'

import Settings from './pages/shared/Settings'
import Notifications from './pages/shared/Notifications'

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, token } = useAuthStore()
  if (!token || !user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role) && user.role !== 'admin') return <Navigate to="/" />
  return <>{children}</>
}

function RoleRedirect() {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" />
  const roleMap: Record<string, string> = {
    admin: '/admin',
    sales: '/sales',
    designer: '/designer',
    client: '/portal',
  }
  return <Navigate to={roleMap[user.role] || '/login'} />
}

export default function App() {
  const { init } = useAuthStore()
  useEffect(() => { init() }, [])

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="projects" element={<ProjectBoard />} />
          <Route path="assign" element={<ProjectAssignment />} />
          <Route path="team" element={<TeamManagement />} />
          <Route path="employees" element={<EmployeeDirectory />} />
          <Route path="leaves" element={<LeaveAttendance />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="capacity" element={<CapacityCalendar />} />
          <Route path="performance" element={<PerformanceDocs />} />
          <Route path="settings" element={<Settings />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* Sales */}
        <Route path="/sales" element={<ProtectedRoute roles={['sales', 'admin']}><SalesLayout /></ProtectedRoute>}>
          <Route index element={<SalesDashboard />} />
          <Route path="leads" element={<SalesLeads />} />
          <Route path="leads/:id" element={<SalesLeadDetail />} />
          <Route path="projects" element={<SalesProjects />} />
          <Route path="followups" element={<SalesFollowups />} />
          <Route path="analytics" element={<SalesAnalytics />} />
          <Route path="activity" element={<SalesActivityLog />} />
          <Route path="settings" element={<Settings />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* Designer */}
        <Route path="/designer" element={<ProtectedRoute roles={['designer', 'admin']}><DesignerLayout /></ProtectedRoute>}>
          <Route index element={<DesignerDayView />} />
          <Route path="projects" element={<DesignerProjects />} />
          <Route path="workspace" element={<ProjectWorkspace />} />
          <Route path="messages" element={<DesignerMessages />} />
          <Route path="settings" element={<Settings />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* Client Portal */}
        <Route path="/portal" element={<ProtectedRoute roles={['client', 'admin']}><PortalLayout /></ProtectedRoute>}>
          <Route index element={<PortalDashboard />} />
          <Route path="projects/new" element={<NewProjectWizard />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="projects" element={<ClientMyProjects />} />
          <Route path="history" element={<ProjectHistory />} />
          <Route path="billing" element={<Billing />} />
          <Route path="settings" element={<Settings />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        <Route path="/" element={<RoleRedirect />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
