import { useEffect } from 'react'
import { CreditCard, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { useInvoiceStore } from '../../store/useApiStores'
import { SkeletonStats } from '../../components/ui/Skeleton'

const statusMap = {
  paid: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: CheckCircle, label: 'Paid' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-600', icon: Clock, label: 'Pending' },
  overdue: { bg: 'bg-red-50', text: 'text-red-600', icon: AlertCircle, label: 'Overdue' },
}

export default function Billing() {
  const { invoices, loading, fetchInvoices } = useInvoiceStore()

  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="h-8 bg-slate-200 rounded w-48 animate-pulse" />
      <SkeletonStats />
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="h-5 bg-slate-200 rounded w-32 animate-pulse" />
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
              <div className="text-right space-y-1">
                <div className="h-4 bg-slate-200 rounded w-16" />
                <div className="h-3 bg-slate-100 rounded w-12" />
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
        <h1 className="text-2xl font-semibold text-slate-900">Billing & Invoices</h1>
        <p className="text-sm text-slate-500 mt-1">Track payments and download invoices</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-5">
          <p className="text-sm text-slate-500 mb-1">Total Paid</p>
          <p className="text-2xl font-semibold text-emerald-600">₹{totalPaid.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-5">
          <p className="text-sm text-slate-500 mb-1">Pending</p>
          <p className="text-2xl font-semibold text-amber-600">₹{totalPending.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-5">
          <p className="text-sm text-slate-500 mb-1">Total Invoices</p>
          <p className="text-2xl font-semibold text-slate-900">{invoices.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Invoice History</h2>
          <button className="border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-all text-sm flex items-center gap-2 font-medium">
            <CreditCard className="h-4 w-4" /> Add Payment Method
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {invoices.map((inv) => {
            const s = statusMap[inv.status as keyof typeof statusMap]
            const Icon = s.icon
            return (
              <div key={inv.id} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-all duration-200">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-5 w-5 ${s.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900 text-sm">{inv.id}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${s.bg} ${s.text}`}>{s.label}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{inv.project_name} · {inv.created_at?.slice(0,10)} · {inv.method}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-slate-900">{inv.amount}</p>
                  <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 ml-auto transition-colors">
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
