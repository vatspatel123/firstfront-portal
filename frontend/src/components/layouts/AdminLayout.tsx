import SidebarLayout from './SidebarLayout'
import { LayoutDashboard, Users, BarChart3, Calendar, ClipboardList, UserCheck, FileText, Settings, Bell, Briefcase, CalendarCheck, Wrench, Shield } from 'lucide-react'

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/projects', label: 'Project Board', icon: ClipboardList },
  { path: '/admin/assign', label: 'Assign Projects', icon: Briefcase },
  { path: '/admin/team', label: 'Design Team', icon: Users },
  { path: '/admin/employees', label: 'Employees', icon: UserCheck },
  { path: '/admin/leaves', label: 'Leave & Attendance', icon: CalendarCheck },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/admin/capacity', label: 'Capacity', icon: Calendar },
  { path: '/admin/performance', label: 'Performance', icon: FileText },
  { path: '/admin/tools', label: 'Tools', icon: Wrench },
  { path: '/admin/audit', label: 'Audit Log', icon: Shield },
  { path: '/admin/notifications', label: 'Notifications', icon: Bell },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout() {
  return <SidebarLayout navItems={navItems} roleLabel="Admin Panel" />
}
