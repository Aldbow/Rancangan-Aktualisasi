'use client'

import { useState, useEffect } from 'react'

// This component demonstrates dynamic imports for code splitting
export function LazyComponentLoader() {
  const [Component, setComponent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Dynamically import the component only when needed
    import('@/components/heavy-component')
      .then((module) => {
        setComponent(() => module.HeavyComponent)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err)
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-4 text-red-500">
        Error loading component
      </div>
    )
  }

  if (Component) {
    return <Component />
  }

  return null
}

// Higher-order component for code splitting
export function withLazyLoading(WrappedComponent, fallback = null) {
  return function LazyComponent(props) {
    const [loadedComponent, setLoadedComponent] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
      // Simulate async loading
      const timer = setTimeout(() => {
        setLoadedComponent(() => WrappedComponent)
        setIsLoading(false)
      }, 100)

      return () => clearTimeout(timer)
    }, [])

    if (isLoading) {
      return fallback || <div className="animate-pulse">Loading...</div>
    }

    return loadedComponent ? <WrappedComponent {...props} /> : null
  }
}