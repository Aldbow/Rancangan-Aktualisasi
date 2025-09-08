'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  priority?: boolean
  className?: string
  quality?: number
  sizes?: string
  onLoad?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  quality = 75,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  onLoad,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Reset error state when src changes
    setHasError(false)
  }, [src])

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  // Fallback for error state
  if (hasError) {
    return (
      <div 
        className={`bg-slate-200 dark:bg-slate-700 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-slate-500 dark:text-slate-400 text-xs">Image not available</span>
      </div>
    )
  }

  return (
    <div className={`${className} ${isLoading ? 'bg-slate-100 dark:bg-slate-800 animate-pulse' : ''}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={quality}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          transition: 'opacity 0.3s ease-in-out',
          opacity: isLoading ? 0 : 1
        }}
        {...props}
      />
    </div>
  )
}