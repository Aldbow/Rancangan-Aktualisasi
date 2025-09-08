'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Building2, Users, Star, TrendingUp, Download, Award, Trophy, Medal, ChevronDown, FileText, FileSpreadsheet, Search, Filter, MapPin, Phone, Calendar, User, X } from 'lucide-react'
import { StarRating } from '@/components/ui/star-rating'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'
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

interface PenyediaWithDetails extends PenyediaWithRating {
  penilaian: Penilaian[]
}

export default function LaporanPage() {
  const [penyediaData, setPenyediaData] = useState<PenyediaWithRating[]>([])
  const [penilaianData, setPenilaianData] = useState<Penilaian[]>([])
  const [ppkData, setPpkData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('semua')
  const [sortOption, setSortOption] = useState('a-z')
  const [starFilter, setStarFilter] = useState('all')
  const [starSort, setStarSort] = useState('none')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [screenSize, setScreenSize] = useState<'sm' | 'md' | 'lg'>('lg')
  const [selectedPenyedia, setSelectedPenyedia] = useState<PenyediaWithDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch data
  useEffect(() => {
    fetchData()
  }, [])

  // Track screen size for responsive pagination
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setScreenSize('sm')
      } else if (window.innerWidth < 768) {
        setScreenSize('md')
      } else {
        setScreenSize('lg')
      }
    }

    handleResize() // Set initial size
    window.addEventListener('resize', handleResize)
    
    return () => window.removeEventListener('resize', handleResize)
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

  // Filter data based on search, status, and star rating
  // (Moved after mapScoreToStars function definition)

  // Reset to first page when search, filter, sort, star filter, or star sort changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterStatus, sortOption, starFilter, starSort])

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

  // Filter data based on search, status, and star rating
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
    
    // Apply star filter
    if (starFilter === 'rated') return penyedia.totalPenilaian > 0
    if (starFilter === 'unrated') return penyedia.totalPenilaian === 0
    
    return true
  }).sort((a, b) => {
    // Apply star rating sorting first
    if (starSort === 'high-low') {
      // Sort by mapped star rating (highest first), then by total evaluations
      const aStars = mapScoreToStars(a.rataRataSkor);
      const bStars = mapScoreToStars(b.rataRataSkor);
      
      if (bStars !== aStars) {
        return bStars - aStars;
      }
      // If stars are equal, sort by number of evaluations (more evaluations first)
      return b.totalPenilaian - a.totalPenilaian;
    } else if (starSort === 'low-high') {
      // Sort by mapped star rating (lowest first), then by total evaluations
      const aStars = mapScoreToStars(a.rataRataSkor);
      const bStars = mapScoreToStars(b.rataRataSkor);
      
      if (aStars !== bStars) {
        return aStars - bStars;
      }
      // If stars are equal, sort by number of evaluations (more evaluations first)
      return b.totalPenilaian - a.totalPenilaian;
    }
    
    // Apply alphabetical sorting based on sort option
    if (sortOption === 'a-z') {
      return a.namaPerusahaan.localeCompare(b.namaPerusahaan)
    } else if (sortOption === 'z-a') {
      return b.namaPerusahaan.localeCompare(a.namaPerusahaan)
    }
    
    return 0
  })

  // Pagination calculations
  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = filteredData.slice(startIndex, endIndex)

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

  // Get final evaluation text for ratings (1-3 scale)
  const getRatingEvaluationText = (rating: number) => {
    if (rating === 3) return 'Sangat Baik'
    if (rating >= 2 && rating < 3) return 'Baik'
    if (rating >= 1 && rating < 2) return 'Cukup'
    if (rating === 0) return 'Buruk'
    return 'Cukup' // fallback
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data laporan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 lg:space-y-8 p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <motion.div 
        className="text-center space-y-3 lg:space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3">
          <motion.div 
            className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent">
            Laporan Penilaian
          </h1>
        </div>
        <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto px-2">
          Analisis komprehensif penilaian penyedia barang/jasa UKPBJ Kemnaker
        </p>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-blue-500 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 group rounded-2xl">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Penyedia</p>
                  <p className="text-3xl font-bold text-blue-600">{totalPenyedia}</p>
                </div>
                <motion.div 
                  className="p-3 bg-blue-100 rounded-xl"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Building2 className="h-6 w-6 text-blue-600" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 group rounded-2xl">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Penilaian</p>
                  <p className="text-3xl font-bold text-green-600">{totalPenilaian}</p>
                </div>
                <motion.div 
                  className="p-3 bg-green-100 rounded-xl"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-l-4 border-l-purple-500 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 group rounded-2xl">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">PPK Aktif</p>
                  <p className="text-3xl font-bold text-purple-600">{totalPPK}</p>
                </div>
                <motion.div 
                  className="p-3 bg-purple-100 rounded-xl"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Users className="h-6 w-6 text-purple-600" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Star Rating Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="border-l-4 border-l-amber-500 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl">
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
            <div className="space-y-4">
              {[5, 4, 3, 2, 1].map((starCount) => {
                const count = starDistribution[starCount as keyof typeof starDistribution]
                const percentage = totalWithRatings > 0 ? (count / totalWithRatings) * 100 : 0
                
                return (
                  <motion.div 
                    key={starCount} 
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * starCount }}
                  >
                    <div className="flex items-center space-x-1 w-16">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{starCount}</span>
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    </div>
                    <div className="flex-1">
                      <Progress value={percentage} className="h-2.5" />
                    </div>
                    <div className="flex items-center space-x-2 w-24 justify-end">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{count}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">({percentage.toFixed(1)}%)</span>
                    </div>
                  </motion.div>
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
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filter & Pencarian</span>
            </CardTitle>
            <CardDescription>Cari dan filter data penyedia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 bg-white dark:bg-slate-800 p-4 lg:p-6 rounded-xl shadow-sm border">
              <div className="flex flex-col gap-4">
                <div className="relative w-full group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-emerald-500 h-5 w-5 transition-colors duration-300" />
                  <input
                    type="text"
                    placeholder="Cari penyedia..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:text-white w-full text-base transition-all duration-300 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10 dark:hover:border-emerald-400"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between gap-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-base"
                    >
                      <option value="all">Semua Status</option>
                      <option value="excellent">Sangat Baik (3.0)</option>
                      <option value="good">Baik (≥2.0)</option>
                      <option value="average">Cukup (≥1.0)</option>
                      <option value="poor">Buruk (0)</option>
                    </select>

                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-base"
                    >
                      <option value="a-z">A-Z</option>
                      <option value="z-a">Z-A</option>
                    </select>

                    <select
                      value={starFilter}
                      onChange={(e) => setStarFilter(e.target.value)}
                      className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-base"
                    >
                      <option value="all">Semua Penyedia</option>
                      <option value="rated">Sudah Dinilai</option>
                      <option value="unrated">Belum Dinilai</option>
                    </select>

                    <select
                      value={starSort}
                      onChange={(e) => setStarSort(e.target.value)}
                      className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-base"
                    >
                      <option value="none">Tanpa Sortir Bintang</option>
                      <option value="high-low">Bintang Tinggi-Rendah</option>
                      <option value="low-high">Bintang Rendah-Tinggi</option>
                    </select>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center space-x-2 text-base px-4 py-3 rounded-xl">
                        <Download className="h-5 w-5" />
                        <span className="hidden sm:inline">Export Data</span>
                        <span className="sm:hidden">Export</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={exportToCSV}>
                        <FileText className="h-5 w-5 mr-2" />
                        Export CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={exportToExcel}>
                        <FileSpreadsheet className="h-5 w-5 mr-2" />
                        Export Excel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Penyedia Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="rounded-2xl">
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
              <div className="space-y-4">
                {paginatedData.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-2xl hover:shadow-slate-500/20 transition-all duration-500 hover:scale-[1.01] hover:-translate-y-1 bg-gradient-to-r from-white to-gray-50 dark:from-slate-800 dark:to-slate-700 group rounded-2xl border">
                      <CardContent className="p-5">
                        <div 
                          className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between cursor-pointer"
                          onClick={async () => {
                            // Fetch detailed penilaian data for this provider
                            try {
                              const response = await fetch(`/api/penyedia/${item.id}/penilaian`)
                              if (response.ok) {
                                const penilaian = await response.json()
                                const penyediaWithDetails: PenyediaWithDetails = {
                                  ...item,
                                  penilaian
                                }
                                setSelectedPenyedia(penyediaWithDetails)
                                setIsModalOpen(true)
                              }
                            } catch (error) {
                              console.error('Error fetching penilaian data:', error)
                              // Still show the modal with available data
                              const penyediaWithDetails: PenyediaWithDetails = {
                                ...item,
                                penilaian: []
                              }
                              setSelectedPenyedia(penyediaWithDetails)
                              setIsModalOpen(true)
                            }
                          }}
                        >
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
                              <motion.div 
                                className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:shadow-xl group-hover:scale-110 transition-all duration-300"
                                whileHover={{ scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 400 }}
                              >
                                <Building2 className="h-6 w-6 text-white" />
                              </motion.div>
                              <div>
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{item.namaPerusahaan}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{item.jenisUsaha}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
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
                              <div className={`text-sm font-medium mt-2 px-3 py-1 rounded-full inline-block ${getRatingColor(item.rataRataSkor)}`}>
                                {getRatingText(item.rataRataSkor)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
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
                
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  {/* Items per page selector - responsive */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap hidden xs:block">Items per halaman:</label>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap xs:hidden">Item:</label>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      className="px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm w-full sm:w-auto"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  {/* Pagination buttons - responsive */}
                  <div className="flex items-center gap-1 sm:gap-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="hidden xs:inline">Sebelumnya</span>
                      <span className="xs:hidden">Prev</span>
                    </button>

                    {/* Page Numbers - responsive with ellipsis for small screens */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(screenSize === 'sm' ? 3 : screenSize === 'md' ? 4 : 5, totalPages) }, (_, i) => {
                        let pageNum;
                        const maxVisiblePages = screenSize === 'sm' ? 3 : screenSize === 'md' ? 4 : 5;
                        if (totalPages <= maxVisiblePages) {
                          pageNum = i + 1;
                        } else if (currentPage <= (screenSize === 'sm' ? 2 : screenSize === 'md' ? 2 : 3)) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - (screenSize === 'sm' ? 1 : screenSize === 'md' ? 1 : 2)) {
                          pageNum = totalPages - (screenSize === 'sm' ? 2 : screenSize === 'md' ? 2 : 4) + i;
                        } else {
                          pageNum = currentPage - (screenSize === 'sm' ? 1 : screenSize === 'md' ? 1 : 2) + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                              currentPage === pageNum
                                ? 'bg-emerald-600 text-white'
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
                      className="px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="hidden xs:inline">Selanjutnya</span>
                      <span className="xs:hidden">Next</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Performers */}
      {penyediaData.filter(p => p.totalPenilaian > 0).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="rounded-2xl">
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
                    <motion.div
                      key={penyedia.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className={`relative overflow-hidden rounded-2xl ${
                        index === 0 ? 'ring-2 ring-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 dark:ring-yellow-300' :
                        index === 1 ? 'ring-2 ring-gray-400 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 dark:ring-gray-300' :
                        'ring-2 ring-orange-400 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 dark:ring-orange-300'
                      }`}>
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg ${
                              index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                              index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                              'bg-gradient-to-r from-orange-400 to-orange-600'
                            }`}>
                              {index === 0 ? <Trophy className="h-7 w-7" /> :
                               index === 1 ? <Medal className="h-7 w-7" /> :
                               <Award className="h-7 w-7" />}
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
                              className="h-2.5"
                            />
                          </div>
                          
                          <div className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-500' : 'bg-orange-500'
                          }`}>
                            #{index + 1}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Provider Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedPenyedia && (
          <motion.div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    Detail Penyedia
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Tutup detail penyedia"
                  >
                    <X className="h-5 w-5" />
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
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                          <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Nama Perusahaan
                          </p>
                          <p className="font-medium text-slate-800 dark:text-slate-100">
                            {selectedPenyedia.namaPerusahaan}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                          <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Alamat
                          </p>
                          <p className="font-medium text-slate-800 dark:text-slate-100">
                            {selectedPenyedia.alamat || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                          <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Kontak
                          </p>
                          <p className="font-medium text-slate-800 dark:text-slate-100">
                            {selectedPenyedia.kontak || "-"}
                          </p>
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
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            NPWP
                          </p>
                          <p className="font-medium text-slate-800 dark:text-slate-100">
                            {selectedPenyedia.npwp}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                          <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Jenis Usaha
                          </p>
                          <p className="font-medium text-slate-800 dark:text-slate-100">
                            {selectedPenyedia.jenisUsaha}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Tanggal Registrasi
                          </p>
                          <p className="font-medium text-slate-800 dark:text-slate-100">
                            {new Date(
                              selectedPenyedia.tanggalRegistrasi
                            ).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ratings Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 mb-8">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                    Ringkasan Penilaian
                  </h3>
                  <div className="flex flex-col sm:flex-row items-center justify-between">
                    <div className="flex items-center mb-4 sm:mb-0">
                      <StarRating
                        rating={mapScoreToStars(
                          selectedPenyedia.rataRataSkor
                        )}
                        size="lg"
                        showValue={false}
                        className="mr-4"
                      />
                      <div>
                        <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                          {selectedPenyedia.rataRataSkor.toFixed(1)}
                        </div>
                        <div
                          className={`text-sm px-3 py-1 rounded-full font-medium inline-block ${getRatingColor(
                            selectedPenyedia.rataRataSkor
                          )}`}
                        >
                          {getRatingEvaluationText(
                            selectedPenyedia.rataRataSkor
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-center sm:text-right">
                      <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">
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
                      {selectedPenyedia.penilaian.map((penilaian, index) => (
                        <motion.div
                          key={penilaian.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                            <div className="flex items-center mb-2 sm:mb-0">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-2">
                                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                              </div>
                              <span className="font-medium text-slate-800 dark:text-slate-100">
                                {penilaian.namaPPK}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <div className="p-1 bg-slate-100 dark:bg-slate-700 rounded mr-1">
                                <Calendar className="h-4 w-4 text-slate-500" aria-hidden="true" />
                              </div>
                              <span className="text-sm text-slate-600 dark:text-slate-300">
                                {new Date(
                                  penilaian.tanggalPenilaian
                                ).toLocaleDateString("id-ID")}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <div className="mb-4 sm:mb-0">
                              <StarRating
                                rating={mapScoreToStars(penilaian.skorTotal)}
                                size="md"
                                showValue={false}
                                className="mb-2"
                              />
                              <div
                                className={`text-xs px-3 py-1 rounded-full font-medium inline-block ${getRatingColor(
                                  penilaian.skorTotal
                                )}`}
                              >
                                {penilaian.penilaianAkhir ||
                                  getRatingEvaluationText(penilaian.skorTotal)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                {penilaian.skorTotal.toFixed(1)}/3
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-300">
                                Skor Total
                              </div>
                            </div>
                          </div>

                          {penilaian.keterangan && (
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                              <p className="text-sm text-slate-600 dark:text-slate-300">
                                {penilaian.keterangan}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-slate-600 dark:text-slate-300 text-lg">
                        Belum ada penilaian untuk penyedia ini
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
