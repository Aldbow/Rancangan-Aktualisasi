'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo, memo, useCallback } from 'react'
import { Building2, FileText, BarChart3, Users, Star, Search, MapPin, Phone, Calendar, Award, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useDashboardStats } from '@/lib/use-api-cache'
import { useSearchCache } from '@/lib/use-search-cache'
import { StatCard } from '@/components/optimized/stat-card'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Penyedia, Penilaian } from '@/lib/google-sheets'
import { StarRating } from '@/components/ui/star-rating'

interface DashboardStats {
  totalPenyedia: number
  totalPenilaian: number
  totalPPK: number
  rataRataSkor: string
}

interface PenyediaWithRatings extends Penyedia {
  totalPenilaian: number
  rataRataSkor: number
  penilaian: Penilaian[]
}

export default function HomePage() {
  const { data: dashboardData, loading: isLoading, error } = useDashboardStats()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPenyedia, setSelectedPenyedia] = useState<PenyediaWithRatings | null>(null)
  
  // Optimized search with caching
  const searchPenyedia = useCallback(async (query: string) => {
    const response = await fetch(`/api/penyedia/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Search failed');
    return response.json();
  }, []);
  
  const { results: searchResults, isLoading: isSearching, search } = useSearchCache(searchPenyedia, {
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
    debounceDelay: 250 // Faster response
  });

  // Handle search query changes
  useEffect(() => {
    search(searchQuery);
  }, [searchQuery, search]);

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

  // Map LKPP score (1-3) to 5-star rating
  const mapScoreToStars = (score: number) => {
    if (score === 0) return 0
    if (score >= 1 && score < 2) return 2 // Cukup = 2 stars
    if (score >= 2 && score < 3) return 4 // Baik = 4 stars
    if (score === 3) return 5 // Sangat Baik = 5 stars
    return 1 // fallback
  }

  // Get final evaluation text
  const getFinalEvaluationText = (score: number) => {
    if (score === 3) return 'Sangat Baik'
    if (score >= 2 && score < 3) return 'Baik'
    if (score >= 1 && score < 2) return 'Cukup'
    if (score === 0) return 'Buruk'
    return 'Cukup' // fallback
  }

  // Get rating color based on LKPP scale (1-3)
  const getRatingColor = (rating: number) => {
    if (rating >= 2.5) return 'text-green-600 bg-green-100'
    if (rating >= 2.0) return 'text-blue-600 bg-blue-100'
    if (rating >= 1.0) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

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

      {/* Enhanced Search Section */}
      <Card className="border-2 border-dashed border-blue-200">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent mb-3">
              Cari Penyedia
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-lg">
              Cari penyedia berdasarkan nama perusahaan atau NPWP dengan pencarian yang cepat dan akurat
            </p>
          </div>
          
          {/* Enhanced Search Input - Full Width */}
          <div className="relative mb-8">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-blue-500" />
            </div>
            <input
              type="text"
              placeholder="Ketik nama perusahaan atau NPWP untuk mencari..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-6 py-5 text-lg border-2 border-blue-200 dark:border-blue-700 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 dark:bg-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-lg hover:shadow-xl"
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-6 flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          {/* Enhanced Search Results */}
          {!isSearching && searchResults.length > 0 && (
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Ditemukan {searchResults.length} penyedia
              </div>
              {searchResults.map((penyedia) => (
                <div 
                  key={penyedia.id}
                  onClick={() => setSelectedPenyedia(penyedia)}
                  className="group p-6 border-2 border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 bg-white dark:bg-slate-800"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                          <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {penyedia.namaPerusahaan}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                            {penyedia.jenisUsaha}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          NPWP: {penyedia.npwp}
                        </span>
                        {penyedia.alamat && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {penyedia.alamat.substring(0, 50)}{penyedia.alamat.length > 50 ? '...' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                          {penyedia.totalPenilaian}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Penilaian
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-2 mb-1">
                          <StarRating 
                            rating={mapScoreToStars(penyedia.rataRataSkor)} 
                            size="lg" 
                            showValue={false}
                          />
                        </div>
                        <div className={`text-sm px-3 py-1 rounded-full font-medium ${getRatingColor(penyedia.rataRataSkor)}`}>
                          {getFinalEvaluationText(penyedia.rataRataSkor)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isSearching && searchResults.length === 0 && searchQuery && (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-300">
                Tidak ada penyedia yang ditemukan
              </p>
            </div>
          )}

          {/* Provider Detail Modal */}
          {selectedPenyedia && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                      Detail Penyedia
                    </h2>
                    <button 
                      onClick={() => setSelectedPenyedia(null)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  {/* Provider Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                        Informasi Penyedia
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <Building2 className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Nama Perusahaan</p>
                            <p className="font-medium text-slate-800 dark:text-slate-100">{selectedPenyedia.namaPerusahaan}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Alamat</p>
                            <p className="font-medium text-slate-800 dark:text-slate-100">{selectedPenyedia.alamat || '-'}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Phone className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Kontak</p>
                            <p className="font-medium text-slate-800 dark:text-slate-100">{selectedPenyedia.kontak || '-'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                        Informasi Tambahan
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <FileText className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">NPWP</p>
                            <p className="font-medium text-slate-800 dark:text-slate-100">{selectedPenyedia.npwp}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Award className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Jenis Usaha</p>
                            <p className="font-medium text-slate-800 dark:text-slate-100">{selectedPenyedia.jenisUsaha}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Calendar className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Tanggal Registrasi</p>
                            <p className="font-medium text-slate-800 dark:text-slate-100">
                              {new Date(selectedPenyedia.tanggalRegistrasi).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ratings Summary */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                      Ringkasan Penilaian
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center justify-between">
                      <div className="flex items-center mb-4 sm:mb-0">
                        <StarRating 
                          rating={mapScoreToStars(selectedPenyedia.rataRataSkor)} 
                          size="lg" 
                          showValue={false} 
                          className="mr-4"
                        />
                        <div>
                          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                            {selectedPenyedia.rataRataSkor.toFixed(1)}
                          </div>
                          <div className={`text-sm px-2 py-1 rounded-full inline-block ${getRatingColor(selectedPenyedia.rataRataSkor)}`}>
                            {getFinalEvaluationText(selectedPenyedia.rataRataSkor)}
                          </div>
                        </div>
                      </div>
                      <div className="text-center sm:text-right">
                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                          {selectedPenyedia.totalPenilaian}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          Total Penilaian
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rating History */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                      Riwayat Penilaian
                    </h3>
                    {selectedPenyedia.penilaian.length > 0 ? (
                      <div className="space-y-4">
                        {selectedPenyedia.penilaian.map((penilaian) => (
                          <div 
                            key={penilaian.id} 
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                              <div className="flex items-center mb-2 sm:mb-0">
                                <User className="h-4 w-4 text-blue-500 mr-2" />
                                <span className="font-medium text-slate-800 dark:text-slate-100">
                                  {penilaian.namaPPK}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 text-slate-500 mr-1" />
                                <span className="text-sm text-slate-600 dark:text-slate-300">
                                  {new Date(penilaian.tanggalPenilaian).toLocaleDateString('id-ID')}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                              <div className="mb-3 sm:mb-0">
                                <StarRating 
                                  rating={mapScoreToStars(penilaian.skorTotal)} 
                                  size="md" 
                                  showValue={false} 
                                  className="mb-2"
                                />
                                <div className={`text-xs px-2 py-1 rounded-full inline-block ${getRatingColor(penilaian.skorTotal)}`}>
                                  {penilaian.penilaianAkhir || getFinalEvaluationText(penilaian.skorTotal)}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                  {penilaian.skorTotal.toFixed(1)}/3
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-300">
                                  Skor Total
                                </div>
                              </div>
                            </div>
                            
                            {penilaian.keterangan && (
                              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                  {penilaian.keterangan}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-slate-600 dark:text-slate-300">
                          Belum ada penilaian untuk penyedia ini
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
