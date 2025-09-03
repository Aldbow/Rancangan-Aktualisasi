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
      <div className="p-2 rounded-lg bg-white/10 w-9 h-9" />
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200 group"
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 text-white rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 text-white rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 top-2 left-2" />
    </button>
  )
}
