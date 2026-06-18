import { useEffect } from 'react'
import { CreditCard, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { useInvoiceStore } from '../../store/useApiStores'
import { SkeletonStats } from '../../components/ui/Skeleton'

const statusMap = {
  paid: { bg: 'bg-success-bg', text: 'text-success', icon: CheckCircle, label: 'Paid' },
  pending: { bg: 'bg-warning-bg', text: 'text-warning', icon: Clock, label: 'Pending' },
  overdue: { bg: 'bg-error-bg', text: 'text-error', icon: AlertCircle, label: 'Overdue' },
}

export default function Billing() {
  const { invoices, loading, fetchInvoices } = useInvoiceStore()

  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
      <SkeletonStats />
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-50">
          <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
        <div className="divide-y divide-gray-50">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-lg bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
              <div className="text-right space-y-1">
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-3 bg-gray-100 rounded w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + parseInt(i.amount.replace(/[₹,]/g, '')), 0)
  const totalPending = invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + parseInt(i.amount.replace(/[₹,]/g, '')), 0)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Billing & Invoices</h1>
        <p className="text-gray-500 mt-1">Track payments and download invoices</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-sm text-gray-500 mb-1">Total Paid</p>
          <p className="text-2xl font-bold font-display text-success">₹{totalPaid.toLocaleString('en-IN')}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500 mb-1">Pending</p>
          <p className="text-2xl font-bold font-display text-warning">₹{totalPending.toLocaleString('en-IN')}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500 mb-1">Total Invoices</p>
          <p className="text-2xl font-bold font-display text-ink">{invoices.length}</p>
        </div>
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-display font-semibold text-ink">Invoice History</h2>
          <button className="btn-secondary text-sm flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Add Payment Method
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {invoices.map((inv) => {
            const s = statusMap[inv.status as keyof typeof statusMap]
            const Icon = s.icon
            return (
              <div key={inv.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-5 w-5 ${s.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ink text-sm">{inv.id}</p>
                    <span className={`status-pill ${s.bg} ${s.text}`}>{s.label}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{inv.project_name} · {inv.created_at?.slice(0,10)} · {inv.method}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display font-semibold text-ink">{inv.amount}</p>
                  <button className="text-xs text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1 ml-auto">
                    <Download className="h-3 w-3" /> Download
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
