import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import { useEffect } from 'react'
import PortalLayout from './components/layouts/PortalLayout'
import CrmLayout from './components/layouts/CrmLayout'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import VerifyOTP from './pages/auth/VerifyOTP'
import PortalDashboard from './pages/portal/Dashboard'
import NewProject from './pages/portal/NewProject'
import ProjectDetail from './pages/portal/ProjectDetail'
import ProjectHistory from './pages/portal/ProjectHistory'
import CrmDashboard from './pages/crm/Dashboard'
import Leads from './pages/crm/Leads'
import LeadDetail from './pages/crm/LeadDetail'
import CrmProjects from './pages/crm/Projects'
import Followups from './pages/crm/Followups'

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: string }) {
  const { user, isLoading } = useAuthStore()
  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
  if (!user) return <Navigate to="/login" />
  if (role && user.role !== role && user.role !== 'admin') return <Navigate to="/" />
  return <>{children}</>
}

function RoleRedirect() {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" />
  const roleMap: Record<string, string> = { client: '/portal', designer: '/crm', admin: '/crm', sales: '/crm' }
  return <Navigate to={roleMap[user.role] || '/crm'} />
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
        <Route path="/portal" element={<ProtectedRoute role="client"><PortalLayout /></ProtectedRoute>}>
          <Route index element={<PortalDashboard />} />
          <Route path="projects/new" element={<NewProject />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="history" element={<ProjectHistory />} />
        </Route>
        <Route path="/crm" element={<ProtectedRoute><CrmLayout /></ProtectedRoute>}>
          <Route index element={<CrmDashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="leads/:id" element={<LeadDetail />} />
          <Route path="projects" element={<CrmProjects />} />
          <Route path="followups" element={<Followups />} />
        </Route>
        <Route path="*" element={<RoleRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}
