'use client'

import { createContext, useContext, useEffect, useState } from 'react'

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

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'kemnaker-theme',
  ...props
}: ThemeProviderProps) {
  // Priority Solution 2: Enhanced theme management for in-app navigation
  const [theme, setTheme] = useState<Theme>(() => {
    // Get initial theme from localStorage synchronously if available
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
  const [mounted, setMounted] = useState(false)

  // Hydrate theme state after mount
  useEffect(() => {
    setMounted(true)
    // Theme is already set in useState initializer
  }, [])

  // Enhanced theme application with smooth transitions
  useEffect(() => {
    if (!mounted) return
    
    const root = window.document.documentElement
    let appliedTheme = theme

    if (theme === 'system') {
      appliedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    // Use the enhanced script's transition system
    root.classList.add('theme-transitioning')
    root.classList.remove('light', 'dark')
    root.classList.add(appliedTheme)
    
    // Set CSS custom properties for consistency
    if (appliedTheme === 'dark') {
      root.style.setProperty('--theme-bg', '#0f172a')
      root.style.setProperty('--theme-text', '#f8fafc')
    } else {
      root.style.setProperty('--theme-bg', '#ffffff')
      root.style.setProperty('--theme-text', '#1e293b')
    }
    
    // Remove transition class after animation
    setTimeout(() => {
      root.classList.remove('theme-transitioning')
    }, 200)
  }, [theme, mounted])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      // Enhanced theme setting with immediate application
      localStorage.setItem(storageKey, newTheme)
      setTheme(newTheme)
      
      // Dispatch custom event for immediate theme change
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('theme-change', {
          detail: { theme: newTheme }
        }))
      }
    },
  }

  // Enhanced hydration handling - use actual theme instead of initial state
  if (!mounted) {
    return (
      <ThemeProviderContext.Provider {...props} value={{ theme, setTheme: value.setTheme }}>
        {children}
      </ThemeProviderContext.Provider>
    )
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
