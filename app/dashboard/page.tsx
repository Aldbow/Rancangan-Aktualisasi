'use client'

import { useState } from 'react'
import { BarChart3, ExternalLink, Monitor, TrendingUp, Users, Building2, Star, RefreshCw, Eye, Settings, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from '@/components/ui/separator'

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false)

  // Google Looker Studio dashboard URL
  const dashboardUrl = "https://lookerstudio.google.com/embed/reporting/aac7740e-c054-4026-a27b-90cae85d64d2/page/fgQWF"
  
  const handleRefreshDashboard = () => {
    setIsLoading(true)
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false)
      window.location.reload()
    }, 1000)
  }

  const openInNewTab = () => {
    window.open(dashboardUrl, '_blank')
  }

  return (
    <div className="space-y-6 lg:space-y-8 p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="text-center space-y-3 lg:space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
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
      <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 hover:scale-[1.01]">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base lg:text-lg">
            <Monitor className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
            <span>Dashboard Controls</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Kontrol untuk mengelola tampilan dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 lg:space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 lg:gap-4">
            <Button 
              onClick={handleRefreshDashboard}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-sm lg:text-base py-2 lg:py-3"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-3 w-3 lg:h-4 lg:w-4 border-b-2 border-white"></div>
              ) : (
                <RefreshCw className="h-3 w-3 lg:h-4 lg:w-4" />
              )}
              <span>{isLoading ? 'Memuat...' : 'Refresh Dashboard'}</span>
            </Button>
            
            <Button 
              onClick={openInNewTab}
              variant="outline"
              className="flex items-center space-x-2 text-sm lg:text-base py-2 lg:py-3"
            >
              <ExternalLink className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Buka di Tab Baru</span>
              <span className="sm:hidden">Tab Baru</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card className="hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-[1.05] hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 group">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center space-x-2 lg:space-x-3 mb-3 lg:mb-4">
              <div className="p-2 lg:p-3 bg-blue-600 rounded-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <TrendingUp className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
              </div>
              <h3 className="text-sm lg:text-lg font-semibold text-slate-800 dark:text-slate-100">Real-time Analytics</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-xs lg:text-sm leading-relaxed">
              Data tersinkronisasi secara real-time dengan Google Spreadsheet untuk analisis yang akurat dan up-to-date.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 hover:scale-[1.05] hover:-translate-y-2 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 group">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center space-x-2 lg:space-x-3 mb-3 lg:mb-4">
              <div className="p-2 lg:p-3 bg-emerald-600 rounded-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <BarChart3 className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
              </div>
              <h3 className="text-sm lg:text-lg font-semibold text-slate-800 dark:text-slate-100">Visualisasi Interaktif</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-xs lg:text-sm leading-relaxed">
              Grafik dan chart interaktif yang memudahkan analisis performa penyedia dari berbagai aspek.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-[1.05] hover:-translate-y-2 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 group">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center space-x-2 lg:space-x-3 mb-3 lg:mb-4">
              <div className="p-2 lg:p-3 bg-purple-600 rounded-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <Users className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
              </div>
              <h3 className="text-sm lg:text-lg font-semibold text-slate-800 dark:text-slate-100">Multi-User Access</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-xs lg:text-sm leading-relaxed">
              Akses dashboard dapat dibagikan ke berbagai stakeholder untuk transparansi dan kolaborasi.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Embed */}
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Dashboard Penilaian Penyedia</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                Live
              </Badge>
            </div>
          </CardTitle>
          <CardDescription className="text-blue-100">
            Visualisasi data penilaian penyedia barang/jasa UKPBJ Kemnaker
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
            {/* Google Looker Studio Dashboard Embed */}
            <iframe
              src={dashboardUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              allowFullScreen
              sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              className="rounded-b-lg absolute inset-0"
            ></iframe>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Info */}
      <Card className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20 border-0 shadow-xl">
        <CardContent className="p-4 lg:p-8">
          <div className="text-center space-y-4 lg:space-y-6">
            <div className="flex items-center justify-center space-x-2">
              <Info className="h-4 w-4 lg:h-6 lg:w-6 text-blue-600" />
              <h2 className="text-lg lg:text-2xl font-bold text-slate-800 dark:text-slate-100">Informasi Dashboard</h2>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-3 lg:space-y-4">
              <p className="text-xs lg:text-base text-slate-600 dark:text-slate-300 leading-relaxed px-2">
                Dashboard ini menampilkan visualisasi data penilaian penyedia barang/jasa UKPBJ Kemnaker 
                yang terintegrasi langsung dengan Google Looker Studio. Data yang ditampilkan mencakup:
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mt-4 lg:mt-6">
                <div className="space-y-2 lg:space-y-3">
                  <h3 className="text-sm lg:text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Metrik Utama</span>
                  </h3>
                  <ul className="text-xs lg:text-sm text-slate-600 dark:text-slate-300 space-y-1 text-left">
                    <li>• Total penyedia terdaftar</li>
                    <li>• Jumlah penilaian yang telah diberikan</li>
                    <li>• Rata-rata skor keseluruhan</li>
                    <li>• Distribusi kategori penilaian</li>
                  </ul>
                </div>
                
                <div className="space-y-2 lg:space-y-3">
                  <h3 className="text-sm lg:text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <span>Analisis Lanjutan</span>
                  </h3>
                  <ul className="text-xs lg:text-sm text-slate-600 dark:text-slate-300 space-y-1 text-left">
                    <li>• Tren penilaian per periode</li>
                    <li>• Perbandingan antar penyedia</li>
                    <li>• Analisis per kriteria penilaian</li>
                    <li>• Top performers dan insights</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 lg:mt-8 p-3 lg:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs lg:text-sm text-blue-800 dark:text-blue-200">
                  <strong>Catatan:</strong> Dashboard ini menggunakan data real-time dari Google Sheets. 
                  Jika ada perubahan data, gunakan tombol "Refresh Dashboard" untuk memperbarui tampilan.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
