import { useState, useEffect } from 'react'
import { Star, FileText, Download, Eye, ThumbsUp, AlertCircle } from 'lucide-react'
import { useReviewStore, useEmployeeStore } from '../../store/useApiStores'

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} className={`h-3.5 w-3.5 ${i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
    ))}
  </div>
)

export default function PerformanceDocs() {
  const [tab, setTab] = useState<'reviews' | 'documents'>('reviews')
  const { reviews, loading: reviewsLoading, fetchReviews } = useReviewStore()
  const { employees, fetchEmployees } = useEmployeeStore()
  const [employeeDocs, setEmployeeDocs] = useState<any[]>([])
  const [docsLoading, setDocsLoading] = useState(false)

  useEffect(() => {
    fetchReviews()
    fetchEmployees()
  }, [fetchReviews, fetchEmployees])

  useEffect(() => {
    const fetchAllDocs = async () => {
      if (employees.length === 0) return
      setDocsLoading(true)
      try {
        const API = (await import('../../utils/api')).default
        const allDocs: any[] = []
        for (const emp of employees.slice(0, 5)) {
          try {
            const res = await API.get(`/api/employees/${emp.id}/documents`)
            allDocs.push(...res.data.map((d: any) => ({ ...d, employee: emp.name, avatar: emp.avatar })))
          } catch {}
        }
        setEmployeeDocs(allDocs)
      } catch {}
      setDocsLoading(false)
    }
    fetchAllDocs()
  }, [employees])

  if (reviewsLoading) return (
    <div className="flex justify-center p-8">
      <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Performance & Documents</h1>
        <p className="text-sm text-slate-500 mt-1">Review cycles, ratings, and employee document storage</p>
      </div>

      <div className="flex gap-1 border-b border-slate-100">
        {(['reviews', 'documents'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
              tab === t ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            {t === 'reviews' ? 'Performance Reviews' : 'Documents'}
          </button>
        ))}
      </div>

      {tab === 'reviews' && (
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-400">
              <p>No performance reviews yet.</p>
            </div>
          ) : (
            reviews.map(r => (
              <div key={r.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-5">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                    {r.employee_avatar || r.employee_name?.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-medium text-slate-900">{r.employee_name}</p>
                      <span className="text-xs text-slate-400">· {r.period}</span>
                      {r.status === 'pending' ? (
                        <span className="text-xs px-3 py-1 rounded-full font-medium bg-amber-100 text-amber-700 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Pending
                        </span>
                      ) : (
                        <span className="text-xs px-3 py-1 rounded-full font-medium bg-green-100 text-green-700">Completed</span>
                      )}
                    </div>
                    {r.status === 'completed' ? (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          <StarRating rating={r.rating} />
                          <span className="text-sm font-semibold text-slate-900">{r.rating.toFixed(1)}</span>
                          <span className="text-xs text-slate-400">· Completed review</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-green-50 rounded-xl p-3">
                            <p className="text-xs font-medium text-green-700 flex items-center gap-1 mb-1">
                              <ThumbsUp className="h-3 w-3" /> Strengths
                            </p>
                            <p className="text-sm text-slate-900">{r.strengths}</p>
                          </div>
                          <div className="bg-amber-50 rounded-xl p-3">
                            <p className="text-xs font-medium text-amber-700 flex items-center gap-1 mb-1">
                              <AlertCircle className="h-3 w-3" /> Areas to Improve
                            </p>
                            <p className="text-sm text-slate-900">{r.improvements}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-between bg-amber-50 rounded-xl p-3 mt-2">
                        <p className="text-sm text-slate-900">Review scheduled</p>
                        <button className="bg-blue-600 text-white text-sm py-1.5 px-4 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium">Start Review</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'documents' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Employee Documents</h2>
            <button className="bg-blue-600 text-white text-sm px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium">+ Upload Document</button>
          </div>
          <div className="divide-y divide-slate-100">
            {docsLoading ? (
              <div className="p-8 text-center text-slate-400">Loading documents...</div>
            ) : employeeDocs.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No documents uploaded yet.</div>
            ) : (
              employeeDocs.map((d: any, i: number) => (
                <div key={d.id || i} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {d.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm">{d.name}</p>
                    <p className="text-xs text-slate-400">{d.employee} · {d.size} · Uploaded {d.uploaded?.slice(0,10)}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-colors" title="View">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-colors" title="Download">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
