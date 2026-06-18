import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sun, User, Mail, Phone, Lock, Building2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'

export default function Signup() {
  const navigate = useNavigate()
  const { signup } = useAuthStore()
  const [form, setForm] = useState({ name: '', company_name: '', contact_person: '', email: '', phone: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone || !form.password) return toast.error('Please fill required fields')
    setLoading(true)
    try {
      const { email, phone } = await signup({ ...form, contact_person: form.contact_person || form.name })
      toast.success('Account created! Check your email/phone for OTP')
      navigate('/verify-otp', { state: { email, phone } })
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'name', label: 'Full Name', icon: User, placeholder: 'Rajesh Patel', required: true },
    { key: 'company_name', label: 'Company Name', icon: Building2, placeholder: 'Acme Corp' },
    { key: 'email', label: 'Email', icon: Mail, placeholder: 'you@company.com', type: 'email', required: true },
    { key: 'phone', label: 'Phone', icon: Phone, placeholder: '+91 98765 43210', type: 'tel', required: true },
    { key: 'password', label: 'Password', icon: Lock, placeholder: '••••••••', type: 'password', required: true },
  ]

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-sun-400 flex items-center justify-center mx-auto mb-4">
            <Sun className="h-6 w-6 text-white" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">Create your account</h1>
          <p className="text-gray-500 mt-1">Get started with First Front Solar</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-ink mb-1">{f.label}{f.required && ' *'}</label>
              <div className="relative">
                <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                {f.key === 'password' ? (
                  <>
                    <input
                      type={showPw ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)}
                      placeholder={f.placeholder} className="input-field pl-10 pr-10" required={f.required}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </>
                ) : (
                  <input
                    type={f.type || 'text'} value={(form as any)[f.key]} onChange={e => update(f.key, e.target.value)}
                    placeholder={f.placeholder} className="input-field pl-10" required={f.required}
                  />
                )}
              </div>
            </div>
          ))}

          <button type="submit" disabled={loading} className="btn-primary w-full !py-2.5 disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-500 hover:text-brand-600 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
