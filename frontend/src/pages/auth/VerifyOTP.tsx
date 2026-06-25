import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Sun, KeyRound } from 'lucide-react'
import toast from 'react-hot-toast'

export default function VerifyOTP() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const { verifyOtp } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const email = (location.state as any)?.email || ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await verifyOtp(email, code)
      toast.success('Account verified! Please sign in')
      navigate('/login')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 w-full max-w-md p-8 transition-all duration-200 hover:shadow-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Sun className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-700">Verify your account</h1>
          <p className="text-sm text-slate-500 mt-2">Enter the 6-digit code sent to <span className="font-semibold text-slate-700">{email}</span></p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">OTP Code</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="000000"
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-center text-2xl tracking-widest font-mono"
                maxLength={6}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
          >
            {loading ? 'Verifying...' : 'Verify Account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Didn't receive a code?{' '}
          <button type="button" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">Resend</button>
        </p>
      </div>
    </div>
  )
}
