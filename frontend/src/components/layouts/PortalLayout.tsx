import SidebarLayout from './SidebarLayout'
import { LayoutDashboard, PlusCircle, History, FolderOpen, CreditCard, Bell, Settings } from 'lucide-react'

const navItems = [
  { path: '/portal', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/portal/projects', label: 'My Projects', icon: FolderOpen },
  { path: '/portal/projects/new', label: 'New Project', icon: PlusCircle },
  { path: '/portal/history', label: 'Project History', icon: History },
  { path: '/portal/billing', label: 'Billing', icon: CreditCard },
  { path: '/portal/notifications', label: 'Notifications', icon: Bell },
  { path: '/portal/settings', label: 'Settings', icon: Settings },
]

export default function PortalLayout() {
  return <SidebarLayout navItems={navItems} roleLabel="Client Portal" />
}
