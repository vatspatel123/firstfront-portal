import SidebarLayout from './SidebarLayout'
import { LayoutDashboard, FolderOpen, MessageCircle, Settings, Bell, PenTool, Wrench } from 'lucide-react'

const navItems = [
  { path: '/designer', label: 'My Day', icon: LayoutDashboard },
  { path: '/designer/projects', label: 'Projects', icon: FolderOpen },
  { path: '/designer/workspace', label: 'Workspace', icon: PenTool },
  { path: '/designer/messages', label: 'Messages', icon: MessageCircle },
  { path: '/designer/tools', label: 'Tools', icon: Wrench },
  { path: '/designer/notifications', label: 'Notifications', icon: Bell },
  { path: '/designer/settings', label: 'Settings', icon: Settings },
]

export default function DesignerLayout() {
  return <SidebarLayout navItems={navItems} roleLabel="Designer" />
}
