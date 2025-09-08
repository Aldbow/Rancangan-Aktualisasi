'use client'

import { useEffect } from 'react'

export function FontLoader() {
  useEffect(() => {
    // Add font loading detection
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        // Font loading is complete
        document.documentElement.classList.add('fonts-loaded')
      })
    }
  }, [])

  return null
}