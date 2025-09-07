'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from './theme-provider'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="p-2 rounded-lg bg-white/20 w-9 h-9" />
    )
  }

  return (
    <>
      {theme === 'light' ? (
        <button
          onClick={() => setTheme('dark')}
          className="relative p-2 rounded-lg bg-white/20 hover:bg-white/10 transition-colors duration-200"
          aria-label="Toggle theme"
          suppressHydrationWarning
        >
          <Sun className="h-5 w-5 text-slate-800 transition-all" />
        </button>
      ) : (
        <button
          onClick={() => setTheme('light')}
          className="relative p-2 rounded-lg bg-transparent hover:bg-white/10 transition-colors duration-200"
          aria-label="Toggle theme"
          suppressHydrationWarning
        >
          <Moon className="h-5 w-5 text-white transition-all" />
        </button>
      )}
    </>
  )
}