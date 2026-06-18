import { useState, useEffect } from 'react'
import { Star, FileText, Download, Eye, ThumbsUp, AlertCircle } from 'lucide-react'
import { useReviewStore } from '../../store/useApiStores'
import { EMPLOYEE_DOCUMENTS } from '../../utils/extendedMockData'
import { SkeletonList } from '../../components/ui/Skeleton'

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} className={`h-3.5 w-3.5 ${i <= Math.round(rating) ? 'fill-warning text-warning' : 'text-gray-200'}`} />
    ))}
  </div>
)

export default function PerformanceDocs() {
  const [tab, setTab] = useState<'reviews' | 'documents'>('reviews')
  const { reviews: PERFORMANCE_REVIEWS, loading, fetchReviews } = useReviewStore()

  useEffect(() => { fetchReviews() }, [fetchReviews])

  if (loading) return (
    <div className="space-y-6">
      <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
      <SkeletonList count={4} />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Performance & Documents</h1>
        <p className="text-gray-500 mt-1">Review cycles, ratings, and employee document storage</p>
      </div>

      <div className="flex gap-1 border-b border-gray-100">
        {(['reviews', 'documents'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
              tab === t ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t === 'reviews' ? 'Performance Reviews' : 'Documents'}
          </button>
        ))}
      </div>

      {tab === 'reviews' && (
        <div className="space-y-3">
          {PERFORMANCE_REVIEWS.map(r => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-sm font-bold flex items-center justify-center shrink-0">{r.employee_avatar || r.employee_name?.split(' ').map(n => n[0]).join('')}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-medium text-ink">{r.employee_name}</p>
                    <span className="text-xs text-gray-400">· {r.period}</span>
                    {r.status === 'pending' ? (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-warning-bg text-warning flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Pending
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-success-bg text-success">Completed</span>
                    )}
                  </div>
                  {r.status === 'completed' ? (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <StarRating rating={r.rating} />
                        <span className="text-sm font-semibold text-ink">{r.rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-400">· Completed review</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-success-bg/30 rounded-lg p-3">
                          <p className="text-xs font-medium text-success flex items-center gap-1 mb-1">
                            <ThumbsUp className="h-3 w-3" /> Strengths
                          </p>
                          <p className="text-sm text-ink">{r.strengths}</p>
                        </div>
                        <div className="bg-warning-bg/30 rounded-lg p-3">
                          <p className="text-xs font-medium text-warning flex items-center gap-1 mb-1">
                            <AlertCircle className="h-3 w-3" /> Areas to Improve
                          </p>
                          <p className="text-sm text-ink">{r.improvements}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between bg-warning-bg/30 rounded-lg p-3 mt-2">
                      <p className="text-sm text-ink">Review scheduled</p>
                      <button className="btn-primary text-sm !py-1.5">Start Review</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'documents' && (
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-display font-semibold text-ink">Employee Documents</h2>
            <button className="btn-primary text-sm">+ Upload Document</button>
          </div>
          <div className="divide-y divide-gray-50">
            {EMPLOYEE_DOCUMENTS.map(d => (
              <div key={d.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-brand-500" />
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{d.avatar}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink text-sm">{d.name}</p>
                  <p className="text-xs text-gray-400">{d.employee} · {d.size} · Uploaded {d.uploaded}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button className="p-2 text-gray-400 hover:text-brand-500 rounded-lg hover:bg-gray-50 transition-colors" title="View">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-brand-500 rounded-lg hover:bg-gray-50 transition-colors" title="Download">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
