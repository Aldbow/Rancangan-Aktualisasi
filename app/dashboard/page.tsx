'use client'

import { useState, useEffect } from 'react'
import { BarChart3, ExternalLink, Monitor, TrendingUp, Users, Building2, Star, RefreshCw, Eye, Settings, Info, Loader2, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from '@/components/ui/separator'

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isDashboardLoading, setIsDashboardLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState(false)

  // Google Looker Studio dashboard URL
  const dashboardUrl = "https://lookerstudio.google.com/embed/reporting/aac7740e-c054-4026-a27b-90cae85d64d2/page/fgQWF"
  
  const handleRefreshDashboard = () => {
    setIsLoading(true)
    setIsDashboardLoading(true)
    setDashboardError(false)
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false)
      window.location.reload()
    }, 1500)
  }

  const openInNewTab = () => {
    window.open(dashboardUrl, '_blank')
  }

  // Simulate dashboard loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDashboardLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-6 lg:space-y-8 p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="text-center space-y-3 lg:space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl">
            <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-700 to-purple-600 bg-clip-text text-transparent">
            Dashboard Analytics
          </h1>
        </div>
        <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto px-2">
          Visualisasi data penilaian penyedia barang/jasa UKPBJ Kemnaker secara real-time
        </p>
      </div>

      {/* Dashboard Controls */}
      <Card className="border-2 border-dashed border-purple-300/50 dark:border-purple-700/50 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-500 hover:scale-[1.01] rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base lg:text-lg">
            <Monitor className="h-5 w-5 text-purple-600" />
            <span>Dashboard Controls</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Kontrol untuk mengelola tampilan dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
            <Button 
              onClick={handleRefreshDashboard}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-sm lg:text-base py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 lg:h-5 lg:w-5" />
              )}
              <span>{isLoading ? 'Memuat...' : 'Refresh Dashboard'}</span>
            </Button>
            
            <Button 
              onClick={openInNewTab}
              variant="outline"
              className="flex items-center space-x-2 text-sm lg:text-base py-3 px-4 rounded-xl border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:hover:bg-purple-900/30"
            >
              <ExternalLink className="h-4 w-4 lg:h-5 lg:w-5" />
              <span className="hidden sm:inline">Buka di Tab Baru</span>
              <span className="sm:hidden">Tab Baru</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card className="hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 group rounded-2xl">
          <CardContent className="p-5 lg:p-6">
            <div className="flex items-center space-x-3 lg:space-x-4 mb-4 lg:mb-5">
              <div className="p-3 lg:p-4 bg-purple-600 rounded-xl group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <TrendingUp className="h-5 w-5 lg:h-7 lg:w-7 text-white" />
              </div>
              <h3 className="text-base lg:text-xl font-semibold text-slate-800 dark:text-slate-100">Real-time Analytics</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm lg:text-base leading-relaxed">
              Data tersinkronisasi secara real-time dengan Google Spreadsheet untuk analisis yang akurat dan up-to-date.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 group rounded-2xl">
          <CardContent className="p-5 lg:p-6">
            <div className="flex items-center space-x-3 lg:space-x-4 mb-4 lg:mb-5">
              <div className="p-3 lg:p-4 bg-emerald-600 rounded-xl group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <BarChart3 className="h-5 w-5 lg:h-7 lg:w-7 text-white" />
              </div>
              <h3 className="text-base lg:text-xl font-semibold text-slate-800 dark:text-slate-100">Visualisasi Interaktif</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm lg:text-base leading-relaxed">
              Grafik dan chart interaktif yang memudahkan analisis performa penyedia dari berbagai aspek.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 group rounded-2xl">
          <CardContent className="p-5 lg:p-6">
            <div className="flex items-center space-x-3 lg:space-x-4 mb-4 lg:mb-5">
              <div className="p-3 lg:p-4 bg-blue-600 rounded-xl group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <Users className="h-5 w-5 lg:h-7 lg:w-7 text-white" />
              </div>
              <h3 className="text-base lg:text-xl font-semibold text-slate-800 dark:text-slate-100">Multi-User Access</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm lg:text-base leading-relaxed">
              Akses dashboard dapat dibagikan ke berbagai stakeholder untuk transparansi dan kolaborasi.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Embed */}
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-2xl">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-6 w-6" />
              <span>Dashboard Penilaian Penyedia</span>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-3 py-1">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span>Live</span>
              </Badge>
            </div>
          </CardTitle>
          <CardDescription className="text-blue-100">
            Visualisasi data penilaian penyedia barang/jasa UKPBJ Kemnaker
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 relative">
          <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
            {/* Loading overlay */}
            {isDashboardLoading && (
              <div className="absolute inset-0 bg-white dark:bg-gray-800 z-10 flex items-center justify-center rounded-b-2xl">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">Memuat dashboard...</p>
                </div>
              </div>
            )}
            
            {/* Error overlay */}
            {dashboardError && (
              <div className="absolute inset-0 bg-white dark:bg-gray-800 z-10 flex items-center justify-center rounded-b-2xl">
                <div className="text-center p-6">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Gagal memuat dashboard</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">Terjadi kesalahan saat memuat dashboard. Silakan coba refresh.</p>
                  <Button 
                    onClick={handleRefreshDashboard}
                    disabled={isLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Coba Lagi
                  </Button>
                </div>
              </div>
            )}
            
            {/* Google Looker Studio Dashboard Embed */}
            <iframe
              src={dashboardUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              allowFullScreen
              sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              className="rounded-b-2xl absolute inset-0"
              onLoad={() => setIsDashboardLoading(false)}
              onError={() => {
                setIsDashboardLoading(false)
                setDashboardError(true)
              }}
            ></iframe>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Info */}
      <Card className="bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-800 dark:to-purple-900/20 border-0 shadow-xl rounded-2xl">
        <CardContent className="p-5 lg:p-8">
          <div className="text-center space-y-5 lg:space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <Info className="h-5 w-5 lg:h-7 lg:w-7 text-purple-600" />
              <h2 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100">Informasi Dashboard</h2>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-4 lg:space-y-5">
              <p className="text-sm lg:text-base text-slate-600 dark:text-slate-300 leading-relaxed px-3">
                Dashboard ini menampilkan visualisasi data penilaian penyedia barang/jasa UKPBJ Kemnaker 
                yang terintegrasi langsung dengan Google Looker Studio. Data yang ditampilkan mencakup:
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 mt-5 lg:mt-6">
                <div className="space-y-3 lg:space-y-4">
                  <h3 className="text-base lg:text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                    <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                    <span>Metrik Utama</span>
                  </h3>
                  <ul className="text-sm lg:text-base text-slate-600 dark:text-slate-300 space-y-2 text-left">
                    <li className="flex items-start">
                      <span className="inline-block w-5 h-5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">1</span>
                      <span>Total penyedia terdaftar</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-5 h-5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">2</span>
                      <span>Jumlah penilaian yang telah diberikan</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-5 h-5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">3</span>
                      <span>Rata-rata skor keseluruhan</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-5 h-5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">4</span>
                      <span>Distribusi kategori penilaian</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-3 lg:space-y-4">
                  <h3 className="text-base lg:text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                    <span>Analisis Lanjutan</span>
                  </h3>
                  <ul className="text-sm lg:text-base text-slate-600 dark:text-slate-300 space-y-2 text-left">
                    <li className="flex items-start">
                      <span className="inline-block w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">1</span>
                      <span>Tren penilaian per periode</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">2</span>
                      <span>Perbandingan antar penyedia</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">3</span>
                      <span>Analisis per kriteria penilaian</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">4</span>
                      <span>Top performers dan insights</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 lg:mt-8 p-4 lg:p-5 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <p className="text-sm lg:text-base text-purple-800 dark:text-purple-200 flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Catatan:</strong> Dashboard ini menggunakan data real-time dari Google Sheets. 
                    Jika ada perubahan data, gunakan tombol "Refresh Dashboard" untuk memperbarui tampilan.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}