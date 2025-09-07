'use client'

import Link from 'next/link'
import { useMemo, memo } from 'react'
import { Building2, FileText, BarChart3, Users, Star, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useDashboardStats } from '@/lib/use-api-cache'
import { StatCard } from '@/components/optimized/stat-card'
import { SpeedInsights } from "@vercel/speed-insights/next"

interface DashboardStats {
  totalPenyedia: number
  totalPenilaian: number
  totalPPK: number
  rataRataSkor: string
}

export default function HomePage() {
  const { data: dashboardData, loading: isLoading, error } = useDashboardStats()

  const { stats, topPenyedia } = useMemo(() => {
    if (!dashboardData) {
      return {
        stats: {
          totalPenyedia: 0,
          totalPenilaian: 0,
          totalPPK: 0,
          rataRataSkor: '-'
        },
        topPenyedia: []
      }
    }

    const { penyedia, penilaian, ppk } = dashboardData

    // Calculate stats
    const totalPenyedia = penyedia.length
    const totalPenilaian = penilaian.length
    const totalPPK = ppk.length // Get PPK count from PPK sheet
    const rataRataSkor = penilaian.length > 0
      ? (penilaian.reduce((sum: number, p: any) => sum + p.skorTotal, 0) / penilaian.length).toFixed(1)
      : '-'

    // Calculate top penyedia
    const penyediaWithRatings = penyedia.map((p: any) => {
      const penilaianPenyedia = penilaian.filter((pnl: any) => pnl.idPenyedia === p.id)
      const totalPenilaianCount = penilaianPenyedia.length
      const rataRata = totalPenilaianCount > 0 
        ? penilaianPenyedia.reduce((sum: number, pnl: any) => sum + pnl.skorTotal, 0) / totalPenilaianCount
        : 0
      return {
        ...p,
        totalPenilaian: totalPenilaianCount,
        rataRataSkor: rataRata
      }
    }).filter((p: any) => p.totalPenilaian > 0)
      .sort((a: any, b: any) => b.rataRataSkor - a.rataRataSkor)
      .slice(0, 3)

    return {
      stats: {
        totalPenyedia,
        totalPenilaian,
        totalPPK,
        rataRataSkor
      },
      topPenyedia: penyediaWithRatings
    }
  }, [dashboardData])

  return (
    <div className="space-y-8 p-6">
      <SpeedInsights />
      {/* Hero Section */}
      <div className="text-center space-y-6 lg:space-y-8 mb-12 lg:mb-16 px-2 sm:px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
            <Building2 className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 bg-clip-text text-transparent text-center sm:text-left">
            Sistem Penilaian Penyedia
          </h1>
        </div>
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full inline-block shadow-lg">
          <span className="font-semibold text-sm sm:text-base lg:text-lg">UKPBJ Kementerian Ketenagakerjaan RI</span>
        </div>
        <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
          Platform digital terintegrasi untuk PPK memberikan penilaian terhadap penyedia barang/jasa 
          sesuai dengan standar dan kriteria yang ditetapkan LKPP
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Penyedia"
          value={stats.totalPenyedia}
          icon={Building2}
          color="blue"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Penilaian"
          value={stats.totalPenilaian}
          icon={FileText}
          color="emerald"
          isLoading={isLoading}
        />
        <StatCard
          title="PPK Aktif"
          value={stats.totalPPK}
          icon={Users}
          color="indigo"
          isLoading={isLoading}
        />
        <StatCard
          title="Rata-rata Skor"
          value={`${stats.rataRataSkor}${stats.rataRataSkor !== '-' ? '/5' : ''}`}
          icon={Star}
          color="amber"
          isLoading={isLoading}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Link href="/penilaian" className="group transform transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2">
          <Card className="hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700 border-l-4 border-l-blue-600 dark:border-l-blue-400 group-hover:border-l-8">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 lg:mb-6">
                <div className="p-3 lg:p-4 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-600 dark:to-blue-700 rounded-xl shadow-lg mb-3 sm:mb-0 group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                  <FileText className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-slate-800 dark:text-slate-100 sm:ml-4">Beri Penilaian</h3>
              </div>
              <p className="text-sm lg:text-base text-slate-600 dark:text-slate-300 mb-4 lg:mb-6 leading-relaxed">
                Berikan penilaian terhadap penyedia barang/jasa berdasarkan kriteria UKPBJ Kemnaker
              </p>
              <div className="text-blue-700 dark:text-blue-400 font-semibold group-hover:text-blue-800 dark:group-hover:text-blue-300 flex items-center text-sm lg:text-base">
                Mulai Penilaian 
                <span className="ml-2 transform group-hover:translate-x-2 transition-all duration-300 group-hover:scale-110">→</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/laporan" className="group transform transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2">
          <Card className="hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-500 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-slate-800 dark:to-slate-700 border-l-4 border-l-emerald-600 dark:border-l-emerald-400 group-hover:border-l-8">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 lg:mb-6">
                <div className="p-3 lg:p-4 bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-600 dark:to-emerald-700 rounded-xl shadow-lg mb-3 sm:mb-0 group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                  <BarChart3 className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-slate-800 dark:text-slate-100 sm:ml-4">Lihat Laporan</h3>
              </div>
              <p className="text-sm lg:text-base text-slate-600 dark:text-slate-300 mb-4 lg:mb-6 leading-relaxed">
                Lihat laporan dan statistik penilaian penyedia secara komprehensif dan detail
              </p>
              <div className="text-emerald-700 dark:text-emerald-400 font-semibold group-hover:text-emerald-800 dark:group-hover:text-emerald-300 flex items-center text-sm lg:text-base">
                Buka Laporan 
                <span className="ml-2 transform group-hover:translate-x-2 transition-all duration-300 group-hover:scale-110">→</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>


      {/* Features */}
      <Card className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 border-0 shadow-xl animate-in fade-in duration-700">
        <CardContent className="p-4 sm:p-6 lg:p-10">
          <div className="text-center mb-6 lg:mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 px-2 sm:px-4">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-600 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent mb-3 lg:mb-4">Fitur Utama</h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base lg:text-lg">Solusi lengkap untuk penilaian penyedia yang efisien dan terintegrasi</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="text-center group animate-in slide-in-from-left-8 fade-in duration-700 hover:scale-105 transition-all duration-500 ease-out">
              <div className="p-4 lg:p-6 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-2xl w-fit mx-auto mb-4 lg:mb-6 shadow-lg group-hover:shadow-2xl group-hover:shadow-blue-500/25 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                <Search className="h-8 w-8 lg:h-10 lg:w-10 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 lg:mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Pencarian Cepat</h3>
              <p className="text-sm lg:text-base text-slate-600 dark:text-slate-300 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                Cari penyedia dengan mudah menggunakan fitur pencarian yang canggih dan responsif
              </p>
            </div>
            
            <div className="text-center group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 hover:scale-105 transition-all duration-500 ease-out">
              <div className="p-4 lg:p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 rounded-2xl w-fit mx-auto mb-4 lg:mb-6 shadow-lg group-hover:shadow-2xl group-hover:shadow-emerald-500/25 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                <Users className="h-8 w-8 lg:h-10 lg:w-10 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 lg:mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">Penilaian PPK</h3>
              <p className="text-sm lg:text-base text-slate-600 dark:text-slate-300 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                PPK dapat memberikan penilaian untuk penyedia dengan mudah dan cepat.
              </p>
            </div>
            
            <div className="text-center group animate-in slide-in-from-right-8 fade-in duration-700 delay-500 hover:scale-105 transition-all duration-500 ease-out">
              <div className="p-4 lg:p-6 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-2xl w-fit mx-auto mb-4 lg:mb-6 shadow-lg group-hover:shadow-2xl group-hover:shadow-purple-500/25 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                <BarChart3 className="h-8 w-8 lg:h-10 lg:w-10 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 lg:mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">Laporan Real-time</h3>
              <p className="text-sm lg:text-base text-slate-600 dark:text-slate-300 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                Data tersinkronisasi secara real-time dengan Google Spreadsheet untuk akurasi maksimal
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
