import { useState, useEffect } from 'react'
import { Star, FileText, Download, Eye, ThumbsUp, AlertCircle } from 'lucide-react'
import { useReviewStore, useEmployeeStore } from '../../store/useApiStores'

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} className={`h-3.5 w-3.5 ${i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
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
      <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Performance & Documents</h1>
        <p className="text-gray-500 mt-1">Review cycles, ratings, and employee document storage</p>
      </div>

      <div className="flex gap-1 border-b border-gray-100">
        {(['reviews', 'documents'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
              tab === t ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t === 'reviews' ? 'Performance Reviews' : 'Documents'}
          </button>
        ))}
      </div>

      {tab === 'reviews' && (
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
              <p>No performance reviews yet.</p>
            </div>
          ) : (
            reviews.map(r => (
              <div key={r.id} className="bg-white rounded-xl border p-5">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                    {r.employee_avatar || r.employee_name?.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-medium text-gray-900">{r.employee_name}</p>
                      <span className="text-xs text-gray-400">· {r.period}</span>
                      {r.status === 'pending' ? (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Pending
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">Completed</span>
                      )}
                    </div>
                    {r.status === 'completed' ? (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          <StarRating rating={r.rating} />
                          <span className="text-sm font-semibold text-gray-900">{r.rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-400">· Completed review</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-green-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-green-700 flex items-center gap-1 mb-1">
                              <ThumbsUp className="h-3 w-3" /> Strengths
                            </p>
                            <p className="text-sm text-gray-900">{r.strengths}</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-amber-700 flex items-center gap-1 mb-1">
                              <AlertCircle className="h-3 w-3" /> Areas to Improve
                            </p>
                            <p className="text-sm text-gray-900">{r.improvements}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-between bg-amber-50 rounded-lg p-3 mt-2">
                        <p className="text-sm text-gray-900">Review scheduled</p>
                        <button className="bg-primary-600 text-white text-sm py-1.5 px-4 rounded-lg hover:bg-primary-700">Start Review</button>
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
        <div className="bg-white rounded-xl border">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Employee Documents</h2>
            <button className="bg-primary-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-700">+ Upload Document</button>
          </div>
          <div className="divide-y">
            {docsLoading ? (
              <div className="p-8 text-center text-gray-400">Loading documents...</div>
            ) : employeeDocs.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No documents uploaded yet.</div>
            ) : (
              employeeDocs.map((d: any, i: number) => (
                <div key={d.id || i} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="w-9 h-9 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {d.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{d.name}</p>
                    <p className="text-xs text-gray-400">{d.employee} · {d.size} · Uploaded {d.uploaded?.slice(0,10)}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-50 transition-colors" title="View">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-50 transition-colors" title="Download">
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
