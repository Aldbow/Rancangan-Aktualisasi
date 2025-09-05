'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Building2, Users, Star, TrendingUp, Download, Award, Trophy, Medal, ChevronDown, FileText, FileSpreadsheet, Search } from 'lucide-react'
import { StarRating } from '@/components/ui/star-rating'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Penyedia, Penilaian } from '@/lib/google-sheets'

interface PenyediaWithRating extends Penyedia {
  totalPenilaian: number
  rataRataSkor: number
  penilaianTerbaru: string
  penilaianAkhir?: string
}

export default function LaporanPage() {
  const [penyediaData, setPenyediaData] = useState<PenyediaWithRating[]>([])
  const [penilaianData, setPenilaianData] = useState<Penilaian[]>([])
  const [ppkData, setPpkData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('semua')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Fetch data
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [penyediaResponse, penilaianResponse, ppkResponse] = await Promise.all([
        fetch('/api/penyedia'),
        fetch('/api/penilaian'),
        fetch('/api/ppk')
      ])

      if (penyediaResponse.ok && penilaianResponse.ok && ppkResponse.ok) {
        const penyedia: Penyedia[] = await penyediaResponse.json()
        const penilaian: Penilaian[] = await penilaianResponse.json()
        const ppk: any[] = await ppkResponse.json()

        // Combine data
        const combinedData: PenyediaWithRating[] = penyedia.map(p => {
          const penilaianPenyedia = penilaian.filter(pnl => pnl.idPenyedia === p.id)
          const totalPenilaian = penilaianPenyedia.length
          const rataRataSkor = totalPenilaian > 0 
            ? penilaianPenyedia.reduce((sum, pnl) => sum + pnl.skorTotal, 0) / totalPenilaian
            : 0
          const penilaianTerbaru = totalPenilaian > 0
            ? penilaianPenyedia.sort((a, b) => new Date(b.tanggalPenilaian).getTime() - new Date(a.tanggalPenilaian).getTime())[0].tanggalPenilaian
            : '-'
          const penilaianAkhir = totalPenilaian > 0
            ? penilaianPenyedia.sort((a, b) => new Date(b.tanggalPenilaian).getTime() - new Date(a.tanggalPenilaian).getTime())[0].penilaianAkhir
            : undefined

          return {
            ...p,
            totalPenilaian,
            rataRataSkor,
            penilaianTerbaru,
            penilaianAkhir
          }
        })

        setPenyediaData(combinedData)
        setPenilaianData(penilaian)
        setPpkData(ppk)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter data based on search and status
  const filteredData = penyediaData.filter(penyedia => {
    const matchesSearch = penyedia.namaPerusahaan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      penyedia.npwp.includes(searchQuery)
    
    if (!matchesSearch) return false
    
    // Apply status filter based on LKPP scale (1-3)
    if (filterStatus === 'all') return true
    if (filterStatus === 'excellent') return penyedia.rataRataSkor === 3
    if (filterStatus === 'good') return penyedia.rataRataSkor >= 2 && penyedia.rataRataSkor < 3
    if (filterStatus === 'average') return penyedia.rataRataSkor >= 1 && penyedia.rataRataSkor < 2
    if (filterStatus === 'poor') return penyedia.rataRataSkor === 0
    
    return true
  })

  // Pagination calculations
  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = filteredData.slice(startIndex, endIndex)

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterStatus])

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  // Calculate statistics
  const totalPenyedia = penyediaData.length
  const totalPenilaian = penilaianData.length
  const totalPPK = ppkData.length // Get PPK count from PPK sheet
  
  // Map 1-3 evaluation score to 5-star display
  const mapScoreToStars = (score: number) => {
    if (score === 0) return 0
    if (score >= 1 && score < 2) return 2 // Cukup = 2 stars
    if (score >= 2 && score < 3) return 4 // Baik = 4 stars
    if (score === 3) return 5 // Sangat Baik = 5 stars
    return 1 // fallback
  }
  
  // Calculate star distribution (1-5 stars)
  const calculateStarDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    const totalWithRatings = penyediaData.filter(p => p.totalPenilaian > 0).length
    
    penyediaData.forEach(penyedia => {
      if (penyedia.totalPenilaian > 0) {
        const stars = mapScoreToStars(penyedia.rataRataSkor)
        if (stars >= 1 && stars <= 5) {
          distribution[stars as keyof typeof distribution]++
        }
      }
    })
    
    return { distribution, totalWithRatings }
  }
  
  const { distribution: starDistribution, totalWithRatings } = calculateStarDistribution()

  // Get rating color based on LKPP scale (1-3)
  const getRatingColor = (rating: number) => {
    if (rating >= 2.5) return 'text-green-600 bg-green-100'
    if (rating >= 2.0) return 'text-blue-600 bg-blue-100'
    if (rating >= 1.0) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getRatingText = (rating: number) => {
    if (rating === 3) return 'Sangat Baik'
    if (rating >= 2 && rating < 3) return 'Baik'
    if (rating >= 1 && rating < 2) return 'Cukup'
    if (rating === 0) return 'Buruk'
    return 'Cukup' // fallback
  }

  // Get final evaluation text from penilaian data
  const getFinalEvaluationText = (penilaianAkhir: string) => {
    return penilaianAkhir || 'Belum Dinilai'
  }


  // Prepare export data
  const prepareExportData = () => {
    return filteredData.map(penyedia => ({
      'Nama Perusahaan': penyedia.namaPerusahaan,
      'NPWP': penyedia.npwp,
      'Jenis Usaha': penyedia.jenisUsaha,
      'Alamat': penyedia.alamat,
      'Total Penilaian': penyedia.totalPenilaian,
      'Rata-rata Skor': penyedia.rataRataSkor.toFixed(1),
      'Rating': getRatingText(penyedia.rataRataSkor),
      'Penilaian Akhir': getFinalEvaluationText(penyedia.penilaianAkhir || ''),
      'Penilaian Terbaru': penyedia.penilaianTerbaru !== '-' 
        ? new Date(penyedia.penilaianTerbaru).toLocaleDateString('id-ID')
        : 'Belum ada'
    }))
  }

  // Export data to CSV
  const exportToCSV = () => {
    const csvData = prepareExportData()
    const headers = Object.keys(csvData[0] || {})
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => 
          `"${String(row[header as keyof typeof row]).replace(/"/g, '""')}"`
        ).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `laporan-penyedia-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Export data to Excel
  const exportToExcel = () => {
    const excelData = prepareExportData()
    const headers = Object.keys(excelData[0] || {})
    
    // Create HTML table for Excel
    const htmlTable = `
      <table>
        <thead>
          <tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${excelData.map(row => 
            `<tr>${headers.map(header => 
              `<td>${String(row[header as keyof typeof row])}</td>`
            ).join('')}</tr>`
          ).join('')}
        </tbody>
      </table>
    `

    const blob = new Blob([htmlTable], { 
      type: 'application/vnd.ms-excel;charset=utf-8;' 
    })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `laporan-penyedia-${new Date().toISOString().split('T')[0]}.xls`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data laporan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 lg:space-y-8 p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="text-center space-y-3 lg:space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg">
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent">
            Laporan Penilaian
          </h1>
        </div>
        <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto px-2">
          Analisis komprehensif penilaian penyedia barang/jasa UKPBJ Kemnaker
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 group">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Penyedia</p>
                <p className="text-3xl font-bold text-blue-600">{totalPenyedia}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 group">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Penilaian</p>
                <p className="text-3xl font-bold text-green-600">{totalPenilaian}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 group">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">PPK Aktif</p>
                <p className="text-3xl font-bold text-purple-600">{totalPPK}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
      </div>

      {/* Star Rating Distribution */}
      <Card className="border-l-4 border-l-amber-500 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-amber-600" />
            <span>Distribusi Rating Penyedia</span>
          </CardTitle>
          <CardDescription>
            Distribusi rating berdasarkan {totalWithRatings} penyedia yang sudah dinilai
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((starCount) => {
              const count = starDistribution[starCount as keyof typeof starDistribution]
              const percentage = totalWithRatings > 0 ? (count / totalWithRatings) * 100 : 0
              
              return (
                <div key={starCount} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-16">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{starCount}</span>
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  </div>
                  <div className="flex-1">
                    <Progress value={percentage} className="h-2" />
                  </div>
                  <div className="flex items-center space-x-2 w-20 justify-end">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{count}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
          
          {totalWithRatings === 0 && (
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Belum ada penyedia yang dinilai</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
          <CardDescription>Cari dan filter data penyedia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 bg-white dark:bg-slate-800 p-4 lg:p-6 rounded-lg shadow-sm border">
            <div className="flex flex-col gap-4">
              <div className="relative w-full group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 h-4 w-4 transition-colors duration-300" />
                <input
                  type="text"
                  placeholder="Cari penyedia..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white w-full text-sm lg:text-base transition-all duration-300 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 dark:hover:border-blue-400 hover:scale-[1.01]"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 lg:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm lg:text-base"
                >
                  <option value="all">Semua Status</option>
                  <option value="excellent">Sangat Baik (3.0)</option>
                  <option value="good">Baik (≥2.0)</option>
                  <option value="average">Cukup (≥1.0)</option>
                  <option value="poor">Buruk (0)</option>
                </select>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center space-x-2 text-sm lg:text-base">
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Export Data</span>
                      <span className="sm:hidden">Export</span>
                    </Button>
                  </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={exportToCSV}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToExcel}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Penyedia Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Daftar Penyedia dan Penilaian</span>
          </CardTitle>
          <CardDescription>
            Menampilkan {startIndex + 1}-{Math.min(endIndex, totalItems)} dari {totalItems} penyedia ({totalPenyedia} total terdaftar)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paginatedData.length > 0 ? (
            <div className="space-y-3 lg:space-y-4">
              {paginatedData.map((item) => (
                <Card key={item.id} className="hover:shadow-2xl hover:shadow-slate-500/20 transition-all duration-500 hover:scale-[1.01] hover:-translate-y-2 bg-gradient-to-r from-white to-gray-50 dark:from-slate-800 dark:to-slate-700 group">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                            <Building2 className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-base lg:text-lg font-semibold text-slate-800 dark:text-slate-100">{item.namaPerusahaan}</h3>
                            <p className="text-xs lg:text-sm text-slate-600 dark:text-slate-300">{item.jenisUsaha}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 text-xs lg:text-sm">
                          <div>
                            <p className="text-slate-500 dark:text-slate-400">NPWP</p>
                            <p className="font-medium text-slate-800 dark:text-slate-200 break-all">{item.npwp}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 dark:text-slate-400">Kontak</p>
                            <p className="font-medium text-slate-800 dark:text-slate-200 break-all">{item.kontak}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 dark:text-slate-400">Registrasi</p>
                            <p className="font-medium text-slate-800 dark:text-slate-200">{new Date(item.tanggalRegistrasi).toLocaleDateString('id-ID')}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 dark:text-slate-400">Total Penilaian</p>
                            <p className="font-medium text-slate-800 dark:text-slate-200">{item.totalPenilaian}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="lg:ml-8 border-t lg:border-t-0 pt-4 lg:pt-0">
                        <div className="text-center">
                          <StarRating rating={mapScoreToStars(item.rataRataSkor)} size="lg" showValue={false} className="justify-center" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {searchQuery ? 'Tidak ada penyedia yang ditemukan' : 'Belum ada data penyedia'}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Coba ubah kata kunci pencarian' : 'Data penyedia akan muncul di sini setelah ditambahkan'}
              </p>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                Halaman {currentPage} dari {totalPages} ({totalItems} total items)
              </div>
              
              <div className="flex items-center gap-4">
                {/* Items per page selector */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">Items per halaman:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Performers */}
      {penyediaData.filter(p => p.totalPenilaian > 0).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <span>Penyedia Terbaik</span>
            </CardTitle>
            <CardDescription>
              Top 3 penyedia dengan rating tertinggi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {penyediaData
                .filter(p => p.totalPenilaian > 0)
                .sort((a, b) => b.rataRataSkor - a.rataRataSkor)
                .slice(0, 3)
                .map((penyedia, index) => (
                  <Card key={penyedia.id} className={`relative overflow-hidden ${
                    index === 0 ? 'ring-2 ring-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 dark:ring-yellow-300' :
                    index === 1 ? 'ring-2 ring-gray-400 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 dark:ring-gray-300' :
                    'ring-2 ring-orange-400 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 dark:ring-orange-300'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                          index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                          'bg-gradient-to-r from-orange-400 to-orange-600'
                        }`}>
                          {index === 0 ? <Trophy className="h-6 w-6" /> :
                           index === 1 ? <Medal className="h-6 w-6" /> :
                           <Award className="h-6 w-6" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{penyedia.namaPerusahaan}</h3>
                          <Badge variant="secondary" className="mt-1">{penyedia.jenisUsaha}</Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Total Penilaian</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{penyedia.totalPenilaian}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Rating</span>
                          <StarRating rating={mapScoreToStars(penyedia.rataRataSkor)} size="md" showValue={false} />
                        </div>
                        
                        <Progress 
                          value={(mapScoreToStars(penyedia.rataRataSkor) / 5) * 100} 
                          className="h-2"
                        />
                      </div>
                      
                      <div className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-500' : 'bg-orange-500'
                      }`}>
                        #{index + 1}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
