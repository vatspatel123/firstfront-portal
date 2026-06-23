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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-800 to-primary-900 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="flex items-center gap-3 mb-8">
          <Sun className="h-10 w-10 text-solar-500" />
          <div>
            <h1 className="text-2xl font-bold text-primary-800">Verify OTP</h1>
            <p className="text-sm text-gray-500">Enter the code sent to {email}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OTP Code</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl tracking-widest"
                maxLength={6}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>
    </div>
  )
}
