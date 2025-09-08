'use client'

import { Suspense, ComponentType, ReactNode } from 'react'
import { LoadingSkeleton } from './loading-skeleton'

interface DynamicWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  className?: string
}

export function DynamicWrapper({ 
  children, 
  fallback = <LoadingSkeleton />, 
  className 
}: DynamicWrapperProps) {
  return (
    <div className={className}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </div>
  )
}

// Higher-order component for dynamic imports
export function withDynamicWrapper<P extends object>(
  Component: ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <DynamicWrapper fallback={fallback}>
      <Component {...props} />
    </DynamicWrapper>
  )
  
  WrappedComponent.displayName = `withDynamicWrapper(${Component.displayName || Component.name})`
  
  return WrappedComponent
}
