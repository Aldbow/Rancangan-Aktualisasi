'use client'

import { ReactNode } from 'react'
import { AnimationProvider } from '@/components/animation-provider'
import { FontLoader } from '@/components/font-loader'

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <>
      <FontLoader />
      <AnimationProvider>
        {children}
      </AnimationProvider>
    </>
  )
}