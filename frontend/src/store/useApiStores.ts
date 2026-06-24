import { create } from 'zustand'
import API from '../utils/api'

interface Employee {
  id: string; user_id: string; name: string; role: string; department: string; email: string;
  phone: string; join_date: string; salary: string; status: string; avatar: string;
}
interface Leave {
  id: string; employee_id: string; type: string; from_date: string; to_date: string;
  days: number; reason: string; status: string; employee_name: string;
}
interface Review {
  id: string; employee_id: string; period: string; rating: number; reviewer_id: string;
  status: string; strengths: string; improvements: string; employee_name: string; employee_avatar: string;
}
interface Message {
  id: string; project_id: string; sender_id: string; text: string;
  read: boolean; created_at: string; sender_name: string; sender_avatar: string;
}
interface Invoice {
  id: string; project_id: string; client_id: string; amount: string;
  status: string; method: string; created_at: string; project_name: string;
}

export const useEmployeeStore = create<{
  employees: Employee[]; loading: boolean; fetchEmployees: () => Promise<void>;
}>((set) => ({
  employees: [], loading: false,
  fetchEmployees: async () => {
    set({ loading: true })
    try { const { data } = await API.get('/api/employees/'); set({ employees: data }) }
    catch { set({ employees: [] }) }
    set({ loading: false })
  },
}))

export const useLeaveStore = create<{
  leaves: Leave[]; loading: boolean; fetchLeaves: () => Promise<void>;
  approveLeave: (id: string) => Promise<void>; rejectLeave: (id: string) => Promise<void>;
}>((set) => ({
  leaves: [], loading: false,
  fetchLeaves: async () => {
    set({ loading: true })
    try { const { data } = await API.get('/api/employees/leave/'); set({ leaves: data }) }
    catch { set({ leaves: [] }) }
    set({ loading: false })
  },
  approveLeave: async (id) => {
    await API.patch(`/api/employees/leave/${id}`, { status: 'approved' })
    set((s) => ({ leaves: s.leaves.map(l => l.id === id ? { ...l, status: 'approved' } : l) }))
  },
  rejectLeave: async (id) => {
    await API.patch(`/api/employees/leave/${id}`, { status: 'rejected' })
    set((s) => ({ leaves: s.leaves.map(l => l.id === id ? { ...l, status: 'rejected' } : l) }))
  },
}))

export const useReviewStore = create<{
  reviews: Review[]; loading: boolean; fetchReviews: () => Promise<void>;
}>((set) => ({
  reviews: [], loading: false,
  fetchReviews: async () => {
    set({ loading: true })
    try { const { data } = await API.get('/api/employees/reviews/'); set({ reviews: data }) }
    catch { set({ reviews: [] }) }
    set({ loading: false })
  },
}))

export const useMessageStore = create<{
  messages: Message[]; loading: boolean; fetchMessages: (projectId?: string) => Promise<void>;
  sendMessage: (projectId: string, text: string) => Promise<void>;
}>((set) => ({
  messages: [], loading: false,
  fetchMessages: async (projectId) => {
    set({ loading: true })
    try {
      const url = projectId ? `/api/messages/?project_id=${projectId}` : '/api/messages/'
      const { data } = await API.get(url)
      set({ messages: data })
    } catch { set({ messages: [] }) }
    set({ loading: false })
  },
  sendMessage: async (projectId, text) => {
    const { data } = await API.post('/api/messages/', { project_id: projectId, text })
    set((s) => ({ messages: [...s.messages, data] }))
  },
}))

export const useInvoiceStore = create<{
  invoices: Invoice[]; loading: boolean; fetchInvoices: () => Promise<void>;
}>((set) => ({
  invoices: [], loading: false,
  fetchInvoices: async () => {
    set({ loading: true })
    try { const { data } = await API.get('/api/messages/invoices/'); set({ invoices: data }) }
    catch { set({ invoices: [] }) }
    set({ loading: false })
  },
}))

export interface Project {
  id: string; client_id: string; name: string; location: string; capacity: string;
  project_type: string; services_required: string; notes: string | null;
  status: string; assigned_to: string | null; priority: string | null;
  deadline: string | null; created_at: string; updated_at: string;
  client_name?: string; designer_name?: string;
}

export const useProjectStore = create<{
  projects: Project[]; loading: boolean; fetchProjects: (search?: string) => Promise<void>;
  updateStatus: (id: string, status: string) => Promise<void>;
  assignDesigner: (id: string, assignedTo: string) => Promise<void>;
}>((set) => ({
  projects: [], loading: false,
  fetchProjects: async (search) => {
    set({ loading: true })
    try {
      const url = search ? `/api/projects/?search=${encodeURIComponent(search)}` : '/api/projects/'
      const { data } = await API.get(url)
      set({ projects: data })
    } catch { set({ projects: [] }) }
    set({ loading: false })
  },
  updateStatus: async (id, status) => {
    await API.patch(`/api/projects/${id}/status`, { status })
    set((s) => ({ projects: s.projects.map(p => p.id === id ? { ...p, status } : p) }))
  },
  assignDesigner: async (id, assignedTo) => {
    await API.patch(`/api/projects/${id}/status`, { status: 'assigned', assigned_to: assignedTo })
    set((s) => ({ projects: s.projects.map(p => p.id === id ? { ...p, assigned_to: assignedTo, status: 'assigned' } : p) }))
  },
}))

export interface Notification {
  id: string; type: string; message: string; is_read: boolean;
  related_id: string | null; created_at: string;
}

export const useNotificationStore = create<{
  notifications: Notification[]; unreadCount: number; loading: boolean;
  fetchNotifications: () => Promise<void>; fetchUnreadCount: () => Promise<void>;
  markRead: (id: string) => Promise<void>; markAllRead: () => Promise<void>;
}>((set) => ({
  notifications: [], unreadCount: 0, loading: false,
  fetchNotifications: async () => {
    set({ loading: true })
    try { const { data } = await API.get('/api/notifications/'); set({ notifications: data }) }
    catch { set({ notifications: [] }) }
    set({ loading: false })
  },
  fetchUnreadCount: async () => {
    try { const { data } = await API.get('/api/notifications/unread-count'); set({ unreadCount: data.count }) }
    catch { set({ unreadCount: 0 }) }
  },
  markRead: async (id) => {
    await API.patch(`/api/notifications/${id}/read`)
    set((s) => ({
      notifications: s.notifications.map(n => n.id === id ? { ...n, is_read: true } : n),
      unreadCount: Math.max(0, s.unreadCount - 1)
    }))
  },
  markAllRead: async () => {
    await API.post('/api/notifications/mark-all-read')
    set((s) => ({
      notifications: s.notifications.map(n => ({ ...n, is_read: true })),
      unreadCount: 0
    }))
  },
}))
