interface SkeletonProps {
  className?: string
  count?: number
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
}

export function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-2 bg-gray-100 rounded w-1/3" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-2 bg-gray-100 rounded w-full" />
        <div className="h-2 bg-gray-100 rounded w-4/5" />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[0, 1, 2].map(i => (
        <div key={i} className="card p-5 animate-pulse">
          <div className="w-10 h-10 rounded-lg bg-gray-200 mb-3" />
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-1" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      ))}
    </div>
  )
}
