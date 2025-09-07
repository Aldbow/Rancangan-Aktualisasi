import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import { ThemeScript } from './theme-script'
import { AnimatedLayout } from '@/components/animated-layout'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'Sistem Penilaian Penyedia UKPBJ Kemnaker',
  description: 'Sistem penilaian penyedia barang/jasa untuk PPK sesuai standar UKPBJ Kemnaker',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className="light" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${inter.variable} font-sans`} suppressHydrationWarning>
        <ThemeProvider
          defaultTheme="light"
          storageKey="kemnaker-theme"
        >
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col">
          <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
              <div className="flex justify-between items-center py-3 lg:py-4">
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center p-1">
                    <Image 
                      src="/Logo_Kemnaker.png" 
                      alt="Logo Kemnaker" 
                      width={32}
                      height={32}
                      className="w-full h-full object-contain"
                      priority
                    />
                  </div>
                  {/* <h1 className="hidden md:block text-lg lg:text-2xl font-bold text-slate-800 dark:text-white">
                    Sistem Penilaian Penyedia UKPBJ Kemnaker
                  </h1> */}
                </div>
                <nav className="flex items-center space-x-1 sm:space-x-2">
                  <a href="/" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300">
                    <span className="hidden sm:inline">Beranda</span>
                    <span className="sm:hidden">Home</span>
                  </a>
                  <a href="/penilaian" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300">
                    <span className="hidden sm:inline">Penilaian</span>
                    <span className="sm:hidden">Nilai</span>
                  </a>
                  <a href="/laporan" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300">
                    Laporan
                  </a>
                  <a href="/dashboard" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300">
                    Dashboard
                  </a>
                  <ThemeToggle />
                </nav>
              </div>
            </div>
          </header>
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
            <AnimatedLayout>
              {children}
            </AnimatedLayout>
          </main>
          <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center p-1">
                    <Image 
                      src="/Logo_Kemnaker.png" 
                      alt="Logo Kemnaker" 
                      width={32}
                      height={32}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-slate-800 dark:text-white font-semibold">UKPBJ Kemnaker</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  © 2025 Sistem Penilaian Penyedia UKPBJ Kemnaker.
                </p>
              </div>
            </div>
          </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
