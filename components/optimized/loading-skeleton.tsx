import React from 'react'

interface SkeletonProps {
  className?: string
  width?: string
  height?: string
}

export const Skeleton = React.memo(({ className = '', width = '100%', height = '1rem' }: SkeletonProps) => {
  return (
    <div 
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      style={{ width, height }}
    />
  )
})

Skeleton.displayName = 'Skeleton'

export const CardSkeleton = React.memo(() => (
  <div className="border rounded-lg p-6 space-y-4">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton height="1.5rem" width="200px" />
        <Skeleton height="1rem" width="150px" />
      </div>
      <Skeleton height="3rem" width="3rem" className="rounded-full" />
    </div>
  </div>
))

CardSkeleton.displayName = 'CardSkeleton'

export const StatCardSkeleton = React.memo(() => (
  <div className="border-l-4 border-l-gray-300 rounded-lg p-6">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton height="1rem" width="120px" />
        <Skeleton height="2rem" width="80px" />
      </div>
      <Skeleton height="3rem" width="3rem" className="rounded-xl" />
    </div>
  </div>
))

StatCardSkeleton.displayName = 'StatCardSkeleton'

export const ListSkeleton = React.memo(({ count = 3 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
))

ListSkeleton.displayName = 'ListSkeleton'
