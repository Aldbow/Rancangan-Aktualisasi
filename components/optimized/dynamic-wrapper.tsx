'use client'

import dynamic from 'next/dynamic'
import { ComponentType, Suspense } from 'react'
import { Skeleton } from './loading-skeleton'

// Dynamic import wrapper with loading fallback
export function createDynamicComponent<T extends Record<string, any>>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  fallback?: ComponentType
) {
  const DynamicComponent = dynamic(importFn, {
    loading: () => fallback ? <fallback /> : <Skeleton height="200px" />,
    ssr: true
  })

  return function WrappedComponent(props: T) {
    return (
      <Suspense fallback={fallback ? <fallback /> : <Skeleton height="200px" />}>
        <DynamicComponent {...props} />
      </Suspense>
    )
  }
}

// Pre-configured dynamic components for common use cases
export const DynamicChart = createDynamicComponent(
  () => import('@/components/ui/progress'),
  () => <Skeleton height="100px" className="rounded" />
)

export const DynamicDropdown = createDynamicComponent(
  () => import('@/components/ui/dropdown-menu'),
  () => <Skeleton height="40px" width="120px" className="rounded" />
)
