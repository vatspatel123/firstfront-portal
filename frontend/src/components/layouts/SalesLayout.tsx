import SidebarLayout from './SidebarLayout'
import { LayoutDashboard, Users, Briefcase, CalendarCheck, BarChart3, Activity, Settings, Bell, ClipboardCheck } from 'lucide-react'

const navItems = [
  { path: '/sales', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/sales/leads', label: 'Leads', icon: Users },
  { path: '/sales/review', label: 'Project Review', icon: ClipboardCheck },
  { path: '/sales/projects', label: 'Projects', icon: Briefcase },
  { path: '/sales/followups', label: 'Follow-ups', icon: CalendarCheck },
  { path: '/sales/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/sales/activity', label: 'Activity Log', icon: Activity },
  { path: '/sales/notifications', label: 'Notifications', icon: Bell },
  { path: '/sales/settings', label: 'Settings', icon: Settings },
]

export default function SalesLayout() {
  return <SidebarLayout navItems={navItems} roleLabel="Sales" />
}
