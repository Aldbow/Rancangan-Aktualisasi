'use client'

import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
  className?: string
  height?: string | number
  width?: string | number
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'button'
  lines?: number
  animate?: boolean
}

export function LoadingSkeleton({
  className,
  height = '1rem',
  width = '100%',
  variant = 'default',
  lines = 1,
  animate = true,
}: LoadingSkeletonProps) {
  const baseClasses = cn(
    'bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700',
    animate && 'animate-shimmer bg-[length:200%_100%]',
    'rounded-md'
  )

  if (variant === 'card') {
    return (
      <div className={cn('space-y-4 p-4', className)}>
        <div className={cn(baseClasses, 'h-48 w-full rounded-xl')} />
        <div className="space-y-2">
          <div className={cn(baseClasses, 'h-4 w-3/4')} />
          <div className={cn(baseClasses, 'h-4 w-1/2')} />
        </div>
      </div>
    )
  }

  if (variant === 'text') {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              'h-4',
              i === lines - 1 ? 'w-3/4' : 'w-full'
            )}
          />
        ))}
      </div>
    )
  }

  if (variant === 'avatar') {
    return (
      <div className={cn(baseClasses, 'h-10 w-10 rounded-full', className)} />
    )
  }

  if (variant === 'button') {
    return (
      <div className={cn(baseClasses, 'h-10 w-24 rounded-lg', className)} />
    )
  }

  return (
    <div
      className={cn(baseClasses, className)}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        width: typeof width === 'number' ? `${width}px` : width,
      }}
    />
  )
}

// Specialized skeleton components
export function CardSkeleton({ className }: { className?: string }) {
  return <LoadingSkeleton variant="card" className={className} />
}

export function TextSkeleton({ 
  lines = 3, 
  className 
}: { 
  lines?: number
  className?: string 
}) {
  return <LoadingSkeleton variant="text" lines={lines} className={className} />
}

export function AvatarSkeleton({ className }: { className?: string }) {
  return <LoadingSkeleton variant="avatar" className={className} />
}

export function ButtonSkeleton({ className }: { className?: string }) {
  return <LoadingSkeleton variant="button" className={className} />
}

// Stats card skeleton
export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          <LoadingSkeleton height="1rem" width="6rem" />
          <LoadingSkeleton height="2rem" width="4rem" />
        </div>
        <LoadingSkeleton variant="avatar" className="h-12 w-12" />
      </div>
      <LoadingSkeleton height="0.75rem" width="8rem" />
    </div>
  )
}

// Search result skeleton
export function SearchResultSkeleton() {
  return (
    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <LoadingSkeleton height="1.25rem" width="60%" />
          <LoadingSkeleton height="1rem" width="40%" />
        </div>
        <LoadingSkeleton height="1.5rem" width="4rem" />
      </div>
      <div className="flex items-center space-x-4">
        <LoadingSkeleton height="1rem" width="6rem" />
        <LoadingSkeleton height="1rem" width="8rem" />
      </div>
    </div>
  )
}
