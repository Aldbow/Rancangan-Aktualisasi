'use client'

import * as React from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'light',
  setTheme: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'kemnaker-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(() => {
    // Initialize with the theme that was set by the theme script
    if (typeof window !== 'undefined') {
      try {
        const storedTheme = localStorage.getItem(storageKey) as Theme
        return storedTheme || defaultTheme
      } catch (e) {
        return defaultTheme
      }
    }
    return defaultTheme
  })
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return
    
    const root = window.document.documentElement
    let appliedTheme = theme

    if (theme === 'system') {
      appliedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    // Apply theme classes and data attribute
    root.classList.remove('light', 'dark')
    root.classList.add(appliedTheme)
    root.setAttribute('data-theme', appliedTheme)
  }, [theme, mounted])

  const value = React.useMemo(() => ({
    theme,
    setTheme: (newTheme: Theme) => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, newTheme)
        } catch (e) {
          // Ignore localStorage errors
        }
      }
      setTheme(newTheme)
    },
  }), [theme, storageKey])

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}