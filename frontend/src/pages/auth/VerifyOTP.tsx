import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Sun, ArrowLeft, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'

export default function VerifyOTP() {
  const navigate = useNavigate()
  const location = useLocation()
  const { verifyOTP, resendOTP } = useAuthStore()
  const { email, phone } = (location.state as { email?: string; phone?: string }) || {}

  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newCode = pasted.split('').concat(Array(6 - pasted.length).fill(''))
    setCode(newCode)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fullCode = code.join('')
    if (fullCode.length !== 6) return toast.error('Enter the full 6-digit code')
    setLoading(true)
    try {
      await verifyOTP(email || null, phone || null, fullCode)
      toast.success('Account verified! You can now sign in')
      navigate('/login')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await resendOTP(email || null, phone || null)
      toast.success('OTP resent!')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to resend OTP')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-sun-400 flex items-center justify-center mx-auto mb-4">
            <Sun className="h-6 w-6 text-white" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">Verify your account</h1>
          <p className="text-gray-500 mt-1">
            Enter the 6-digit code sent to{' '}
            <span className="font-medium text-ink">{email || phone}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-6">
          <div className="flex justify-center gap-3">
            {code.map((digit, i) => (
              <input
                key={i} ref={el => { inputRefs.current[i] = el }}
                type="text" inputMode="numeric" maxLength={1}
                value={digit} onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)} onPaste={handlePaste}
                className="w-12 h-14 text-center text-xl font-display font-semibold text-ink border border-gray-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
              />
            ))}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full !py-2.5 disabled:opacity-50">
            {loading ? 'Verifying...' : 'Verify'}
          </button>

          <div className="text-center">
            <button type="button" onClick={handleResend} disabled={resending}
              className="text-sm text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1.5 mx-auto disabled:opacity-50">
              <RotateCcw className={`h-3.5 w-3.5 ${resending ? 'animate-spin' : ''}`} />
              Resend OTP
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/signup" className="text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1 mx-auto">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to signup
          </Link>
        </p>
      </div>
    </div>
  )
}
