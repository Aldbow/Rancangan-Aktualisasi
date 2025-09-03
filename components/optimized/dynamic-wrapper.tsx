'use client'

import dynamic from 'next/dynamic'
import { ComponentType, Suspense } from 'react'
import { Skeleton } from './loading-skeleton'

// Dynamic import wrapper with loading fallback
export function createDynamicComponent<T extends Record<string, any> = Record<string, any>>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  fallback?: ComponentType
) {
  const DynamicComponent = dynamic(importFn, {
    loading: () => {
      if (fallback) {
        const FallbackComponent = fallback
        return <FallbackComponent />
      }
      return <Skeleton height="200px" />
    },
    ssr: true
  })

  return function WrappedComponent(props: T) {
    const fallbackElement = fallback ? (() => {
      const FallbackComponent = fallback
      return <FallbackComponent />
    })() : <Skeleton height="200px" />
    
    return (
      <Suspense fallback={fallbackElement}>
        <DynamicComponent {...(props as any)} />
      </Suspense>
    )
  }
}
