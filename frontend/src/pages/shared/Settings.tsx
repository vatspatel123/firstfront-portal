import { useEffect, useState } from 'react'
import { User, Building2, Mail, Phone, Lock, Bell, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import API from '../../utils/api'

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
] as const

export default function Settings() {
  const { user, fetchMe } = useAuthStore()
  const [tab, setTab] = useState<'profile' | 'security' | 'notifications'>('profile')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [emailNotif, setEmailNotif] = useState(true)
  const [smsNotif, setSmsNotif] = useState(false)
  const [pushNotif, setPushNotif] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(true)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setCompany(user.company_name || '')
      setEmail(user.email || '')
      setPhone(user.phone || '')
    }
  }, [user])

  const handleSaveProfile = async () => {
    try {
      await API.put('/auth/me', {
        name,
        email,
        phone,
        company_name: company
      })
      await fetchMe()
      toast.success('Profile updated successfully')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update profile')
    }
  }

  const handleSaveSecurity = async () => {
    if (!password) {
      toast.error('Please enter a new password')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    try {
      await API.put('/auth/me', { password })
      toast.success('Password updated successfully')
      setPassword('')
      setConfirmPassword('')
    } catch {
      toast.error('Failed to update password')
    }
  }

  const notifItems = [
    { id: 'email', title: 'Email Notifications', desc: 'Project updates, completions, and team messages', emoji: '📧', on: emailNotif, set: setEmailNotif },
    { id: 'sms', title: 'SMS Notifications', desc: 'Urgent alerts and time-sensitive updates', emoji: '💬', on: smsNotif, set: setSmsNotif },
    { id: 'push', title: 'Push Notifications', desc: 'Real-time alerts in your browser', emoji: '🔔', on: pushNotif, set: setPushNotif },
    { id: 'digest', title: 'Weekly Digest', desc: 'Summary of all activity every Monday morning', emoji: '📅', on: weeklyDigest, set: setWeeklyDigest },
  ]

  const avatarInitials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex gap-1 border-b border-gray-100 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t.id ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-display font-semibold text-ink mb-1">Profile Picture</h2>
            <p className="text-sm text-gray-500 mb-4">Your avatar appears across the platform</p>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-lg font-bold flex items-center justify-center">
                {avatarInitials}
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary text-sm" onClick={() => toast.success('Profile picture upload clicked (mock)')}>Upload New</button>
                <button className="btn-ghost text-sm" onClick={() => toast.success('Profile picture removed')}>Remove</button>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-display font-semibold text-ink mb-1">Personal Information</h2>
            <p className="text-sm text-gray-500 mb-4">Update your personal details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field pl-10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Company</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" value={company} onChange={e => setCompany(e.target.value)} className="input-field pl-10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field pl-10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input-field pl-10" />
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={handleSaveProfile} className="btn-primary flex items-center gap-2"><Save className="h-4 w-4" /> Save Changes</button>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-display font-semibold text-ink mb-1">Account Role</h2>
            <p className="text-sm text-gray-500 mb-3">Your current role on the platform</p>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-brand-50 text-brand-600 capitalize">{user?.role}</span>
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="card p-6 space-y-4 max-w-xl">
          <div>
            <h2 className="font-display font-semibold text-ink mb-1">Change Password</h2>
            <p className="text-sm text-gray-500 mb-4">Update your password to keep your account secure</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-2">New Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="input-field" />
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={handleSaveSecurity} className="btn-primary">Update Password</button>
          </div>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-display font-semibold text-ink mb-1">Notification Channels</h2>
            <p className="text-sm text-gray-500 mb-4">Choose how you want to be notified</p>
            <div className="space-y-3">
              {notifItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.emoji}</span>
                    <div>
                      <p className="font-medium text-ink text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                  <button onClick={() => item.set(!item.on)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${item.on ? 'bg-brand-500' : 'bg-gray-200'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${item.on ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
