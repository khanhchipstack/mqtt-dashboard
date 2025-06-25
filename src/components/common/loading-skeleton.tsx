"use client"

interface LoadingSkeletonProps {
  rows?: number
  columns?: number
}

export function LoadingSkeleton({ rows = 3, columns = 3 }: LoadingSkeletonProps) {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-gray-700 rounded w-1/4"></div>
      <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-6`}>
        {[...Array(rows * columns)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-700 rounded"></div>
        ))}
      </div>
    </div>
  )
}
