'use client'

import { useState, useEffect } from 'react'
import { Search, Building2, Star, Send, CheckCircle, Award, TrendingUp, FileText, Lock, User, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Penyedia, PPK } from '@/lib/google-sheets'
import { SearchableSelect } from '@/components/ui/searchable-select'

interface PPKOptions {
  eselonI: { value: string; label: string }[]
  satuanKerja: { value: string; label: string }[]
}

export default function PenilaianPage() {
  // PPK Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authenticatedPPK, setAuthenticatedPPK] = useState<PPK | null>(null)
  const [authForm, setAuthForm] = useState({ 
    nama: '', 
    nip: '', 
    eselonI: '', 
    satuanKerja: '' 
  })
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authError, setAuthError] = useState('')
  const [ppkOptions, setPpkOptions] = useState<PPKOptions>({ eselonI: [], satuanKerja: [] })
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)

  // Evaluation State
  const [searchQuery, setSearchQuery] = useState('')
  const [penyediaList, setPenyediaList] = useState<Penyedia[]>([])
  const [selectedPenyedia, setSelectedPenyedia] = useState<Penyedia | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form data untuk penilaian
  const [formData, setFormData] = useState({
    kualitasBarangJasa: 1,
    ketepatanWaktuPelaksanaan: 1,
    kesesuaianSpesifikasi: 1,
    pelayananPurnaJual: 1,
    profesionalisme: 1,
    keterangan: ''
  })

  // Kriteria penilaian sesuai LKPP
  const kriteriaPenilaian = [
    {
      key: 'kualitasBarangJasa',
      label: 'Kualitas Barang/Jasa',
      description: 'Penilaian terhadap kualitas barang/jasa yang diberikan'
    },
    {
      key: 'ketepatanWaktuPelaksanaan',
      label: 'Ketepatan Waktu Pelaksanaan',
      description: 'Penilaian terhadap ketepatan waktu dalam pelaksanaan pekerjaan'
    },
    {
      key: 'kesesuaianSpesifikasi',
      label: 'Kesesuaian Spesifikasi',
      description: 'Penilaian terhadap kesesuaian dengan spesifikasi yang diminta'
    },
    {
      key: 'pelayananPurnaJual',
      label: 'Pelayanan Purna Jual',
      description: 'Penilaian terhadap pelayanan setelah penyerahan barang/jasa'
    },
    {
      key: 'profesionalisme',
      label: 'Profesionalisme',
      description: 'Penilaian terhadap sikap profesional dalam bekerja'
    }
  ]

  // Skala penilaian
  const skalaPenilaian = [
    { value: 1, label: 'Sangat Buruk', color: 'text-red-600' },
    { value: 2, label: 'Buruk', color: 'text-orange-600' },
    { value: 3, label: 'Cukup', color: 'text-yellow-600' },
    { value: 4, label: 'Baik', color: 'text-blue-600' },
    { value: 5, label: 'Sangat Baik', color: 'text-green-600' }
  ]

  // Load PPK options on component mount
  useEffect(() => {
    const loadPPKOptions = async () => {
      setIsLoadingOptions(true)
      try {
        const response = await fetch('/api/penilaian/ppk-options')
        if (response.ok) {
          const data = await response.json()
          setPpkOptions(data)
        }
      } catch (error) {
        console.error('Error loading PPK options:', error)
      } finally {
        setIsLoadingOptions(false)
      }
    }

    loadPPKOptions()
  }, [])

  // PPK Authentication function
  const authenticatePPK = async () => {
    if (!authForm.nama.trim() || !authForm.nip.trim() || !authForm.eselonI.trim() || !authForm.satuanKerja.trim()) {
      setAuthError('Semua field harus diisi (Nama, NIP, Eselon I, dan Satuan Kerja)')
      return
    }

    setIsAuthenticating(true)
    setAuthError('')

    try {
      const response = await fetch('/api/penilaian/validate-ppk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nama: authForm.nama.trim(),
          nip: authForm.nip.trim(),
          eselonI: authForm.eselonI.trim(),
          satuanKerja: authForm.satuanKerja.trim()
        }),
      })

      const data = await response.json()

      if (data.success) {
        setIsAuthenticated(true)
        setAuthenticatedPPK(data.ppk)
        setAuthError('')
      } else {
        setAuthError(data.error || 'Validasi gagal')
      }
    } catch (error) {
      console.error('Error authenticating PPK:', error)
      setAuthError('Terjadi kesalahan saat validasi. Silakan coba lagi.')
    } finally {
      setIsAuthenticating(false)
    }
  }

  // Handle auth form input change
  const handleAuthInputChange = (field: string, value: string) => {
    setAuthForm(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (authError) {
      setAuthError('')
    }
  }

  // Logout function
  const logout = () => {
    setIsAuthenticated(false)
    setAuthenticatedPPK(null)
    setAuthForm({ nama: '', nip: '', eselonI: '', satuanKerja: '' })
    setSelectedPenyedia(null)
    setSearchQuery('')
    setPenyediaList([])
    setFormData({
      kualitasBarangJasa: 1,
      ketepatanWaktuPelaksanaan: 1,
      kesesuaianSpesifikasi: 1,
      pelayananPurnaJual: 1,
      profesionalisme: 1,
      keterangan: ''
    })
  }

  // Fetch penyedia berdasarkan search
  const searchPenyedia = async (query: string) => {
    if (!query.trim()) {
      setPenyediaList([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/penyedia?search=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setPenyediaList(data)
      }
    } catch (error) {
      console.error('Error searching penyedia:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle search input change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchPenyedia(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Handle form input change
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Calculate average score
  const calculateAverageScore = () => {
    const scores = [
      formData.kualitasBarangJasa,
      formData.ketepatanWaktuPelaksanaan,
      formData.kesesuaianSpesifikasi,
      formData.pelayananPurnaJual,
      formData.profesionalisme
    ]
    return (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)
  }
  
  // Check if form can be submitted
  const canSubmit = selectedPenyedia && authenticatedPPK

  // Submit penilaian
  const submitPenilaian = async () => {
    if (!canSubmit) {
      alert('Mohon lengkapi semua field yang wajib diisi')
      return
    }

    setIsSubmitting(true)
    try {
      const penilaianData = {
        idPenyedia: selectedPenyedia!.id,
        namaPPK: authenticatedPPK!.nama,
        tanggalPenilaian: new Date().toISOString().split('T')[0],
        kualitasBarangJasa: formData.kualitasBarangJasa,
        ketepatanWaktuPelaksanaan: formData.ketepatanWaktuPelaksanaan,
        kesesuaianSpesifikasi: formData.kesesuaianSpesifikasi,
        pelayananPurnaJual: formData.pelayananPurnaJual,
        profesionalisme: formData.profesionalisme,
        keterangan: formData.keterangan
      }

      const response = await fetch('/api/penilaian', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(penilaianData),
      })

      if (response.ok) {
        alert('Penilaian berhasil disimpan!')
        // Reset form
        setSelectedPenyedia(null)
        setFormData({
          kualitasBarangJasa: 1,
          ketepatanWaktuPelaksanaan: 1,
          kesesuaianSpesifikasi: 1,
          pelayananPurnaJual: 1,
          profesionalisme: 1,
          keterangan: ''
        })
        setSearchQuery('')
        setPenyediaList([])
      } else {
        throw new Error('Gagal menyimpan penilaian')
      }
    } catch (error) {
      console.error('Error submitting penilaian:', error)
      alert('Terjadi kesalahan saat menyimpan penilaian')
    } finally {
      setIsSubmitting(false)
    }
  }

  // If not authenticated, show PPK authentication form
  if (!isAuthenticated) {
    return (
      <div className="space-y-6 lg:space-y-8 p-2 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="text-center space-y-3 lg:space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
              Validasi PPK
            </h1>
          </div>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto px-2">
            Masukkan nama lengkap dan NIP Anda untuk mengakses sistem penilaian penyedia
          </p>
        </div>

        {/* PPK Authentication Form */}
        <div className="max-w-md mx-auto">
          <Card className="border-2 border-dashed border-blue-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base lg:text-lg">
                <Lock className="h-5 w-5 text-blue-600" />
                <span>Autentikasi PPK</span>
              </CardTitle>
              <CardDescription>
                Silakan masukkan nama lengkap dan NIP sesuai dengan data PPK yang terdaftar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nama Lengkap *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="nama"
                    type="text"
                    placeholder="Masukkan nama lengkap Anda"
                    value={authForm.nama}
                    onChange={(e) => handleAuthInputChange('nama', e.target.value)}
                    className="pl-10"
                    disabled={isAuthenticating}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nip" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  NIP *
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="nip"
                    type="text"
                    placeholder="Masukkan NIP Anda"
                    value={authForm.nip}
                    onChange={(e) => handleAuthInputChange('nip', e.target.value)}
                    className="pl-10"
                    disabled={isAuthenticating}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Eselon I *
                </Label>
                <SearchableSelect
                  options={ppkOptions.eselonI}
                  value={authForm.eselonI}
                  onValueChange={(value) => handleAuthInputChange('eselonI', value)}
                  placeholder="Pilih Eselon I..."
                  searchPlaceholder="Cari Eselon I..."
                  disabled={isAuthenticating || isLoadingOptions}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Satuan Kerja *
                </Label>
                <SearchableSelect
                  options={ppkOptions.satuanKerja}
                  value={authForm.satuanKerja}
                  onValueChange={(value) => handleAuthInputChange('satuanKerja', value)}
                  placeholder="Pilih Satuan Kerja..."
                  searchPlaceholder="Cari Satuan Kerja..."
                  disabled={isAuthenticating || isLoadingOptions}
                />
              </div>

              {isLoadingOptions && (
                <div className="flex items-center justify-center py-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-muted-foreground">Memuat data...</span>
                </div>
              )}

              {authError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{authError}</p>
                </div>
              )}

              <Button
                onClick={authenticatePPK}
                disabled={isAuthenticating || !authForm.nama.trim() || !authForm.nip.trim() || !authForm.eselonI.trim() || !authForm.satuanKerja.trim() || isLoadingOptions}
                className="w-full"
              >
                {isAuthenticating ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Memvalidasi...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Validasi PPK</span>
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // If authenticated, show the evaluation form
  return (
    <div className="space-y-6 lg:space-y-8 p-2 sm:p-4 lg:p-6">
      {/* Header with PPK Info */}
      <div className="text-center space-y-3 lg:space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
            Penilaian Penyedia
          </h1>
        </div>
        <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto px-2">
          Berikan penilaian terhadap penyedia barang/jasa berdasarkan kriteria LKPP
        </p>
      </div>

      {/* PPK Info Card */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-base lg:text-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>PPK Terautentikasi</span>
            </CardTitle>
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Keluar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-600 dark:text-slate-300">Nama: </span>
              <span className="font-medium text-slate-800 dark:text-slate-100">{authenticatedPPK?.nama}</span>
            </div>
            <div>
              <span className="text-slate-600 dark:text-slate-300">NIP: </span>
              <span className="font-medium text-slate-800 dark:text-slate-100">{authenticatedPPK?.nip}</span>
            </div>
            <div>
              <span className="text-slate-600 dark:text-slate-300">Satuan Kerja: </span>
              <span className="font-medium text-slate-800 dark:text-slate-100">{authenticatedPPK?.satuanKerja}</span>
            </div>
            <div>
              <span className="text-slate-600 dark:text-slate-300">Eselon I: </span>
              <span className="font-medium text-slate-800 dark:text-slate-100">{authenticatedPPK?.eselonI}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Penyedia */}
      <Card className="border-2 border-dashed border-blue-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 hover:scale-[1.01]">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base lg:text-lg">
            <div className="flex items-center justify-center w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-xs lg:text-sm">1</div>
            <span>Pilih Penyedia</span>
          </CardTitle>
          <CardDescription>
            Cari dan pilih penyedia yang akan dinilai
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 lg:space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Cari nama perusahaan atau NPWP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 lg:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm lg:text-base"
            />
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-muted-foreground">Mencari penyedia...</span>
            </div>
          )}

          {penyediaList.length > 0 && (
            <div className="max-h-48 lg:max-h-64 overflow-y-auto space-y-2">
              {penyediaList.map((penyedia) => (
                <div
                  key={penyedia.id}
                  onClick={() => setSelectedPenyedia(penyedia)}
                  className={`p-3 lg:p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                    selectedPenyedia?.id === penyedia.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500 ring-opacity-50'
                      : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/10 dark:hover:to-blue-800/10 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm lg:text-base text-slate-800 dark:text-slate-100 truncate">{penyedia.namaPerusahaan}</h3>
                      <p className="text-xs lg:text-sm text-slate-600 dark:text-slate-300 truncate">{penyedia.jenisUsaha}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 break-all">NPWP: {penyedia.npwp}</p>
                    </div>
                    {selectedPenyedia?.id === penyedia.id && (
                      <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-blue-500 flex-shrink-0 ml-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedPenyedia && (
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base lg:text-lg">
                  <div className="flex items-center justify-center w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-xs lg:text-sm">2</div>
                  <span>Informasi Penyedia Terpilih</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-slate-600 dark:text-slate-300">Nama Perusahaan</p>
                    <p className="text-sm lg:text-lg font-semibold text-slate-800 dark:text-slate-100 break-words">{selectedPenyedia.namaPerusahaan}</p>
                  </div>
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-slate-600 dark:text-slate-300">Jenis Usaha</p>
                    <p className="text-sm lg:text-lg font-semibold text-slate-800 dark:text-slate-100 break-words">{selectedPenyedia.jenisUsaha}</p>
                  </div>
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-slate-600 dark:text-slate-300">NPWP</p>
                    <p className="text-sm lg:text-lg font-semibold text-slate-800 dark:text-slate-100 break-all">{selectedPenyedia.npwp}</p>
                  </div>
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-slate-600 dark:text-slate-300">Kontak</p>
                    <p className="text-sm lg:text-lg font-semibold text-slate-800 dark:text-slate-100 break-all">{selectedPenyedia.kontak}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Rating Form */}
      {selectedPenyedia && (
        <Card className="border-2 border-dashed border-purple-200 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-500 hover:scale-[1.01]">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-base lg:text-lg">
              <div className="flex items-center justify-center w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-purple-100 text-purple-600 font-bold text-xs lg:text-sm">3</div>
              <span>Berikan Penilaian</span>
            </CardTitle>
            <CardDescription>
              Berikan skor 1-5 untuk setiap kriteria penilaian
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 lg:space-y-6">
            {kriteriaPenilaian.map((criteria) => (
              <div key={criteria.key} className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {criteria.label}
                  </Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {criteria.description}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {skalaPenilaian.map((skala) => (
                    <button
                      key={skala.value}
                      type="button"
                      onClick={() => handleInputChange(criteria.key, skala.value)}
                      className={`px-3 py-2 rounded-lg border-2 font-medium text-sm transition-all duration-300 hover:scale-110 hover:shadow-lg ${
                        formData[criteria.key as keyof typeof formData] === skala.value
                          ? 'bg-blue-500 border-blue-500 text-white shadow-lg'
                          : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500'
                      }`}
                    >
                      {skala.value}
                    </button>
                  ))}
                  <div className="ml-4">
                    <span className={`text-sm font-medium ${
                      skalaPenilaian.find(s => s.value === formData[criteria.key as keyof typeof formData])?.color || 'text-gray-500'
                    }`}>
                      {skalaPenilaian.find(s => s.value === formData[criteria.key as keyof typeof formData])?.label || 'Belum dipilih'}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Keterangan */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Keterangan Tambahan (Opsional)
              </Label>
              <Textarea
                value={formData.keterangan}
                onChange={(e) => handleInputChange('keterangan', e.target.value)}
                placeholder="Berikan keterangan tambahan mengenai penilaian ini..."
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Average Score Display */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Rata-rata Skor</h3>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {calculateAverageScore()}
                </div>
                <Progress value={parseFloat(calculateAverageScore()) * 20} className="w-full max-w-xs mx-auto" />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 lg:pt-6">
              <button
                onClick={submitPenilaian}
                disabled={!canSubmit || isSubmitting}
                className={`w-full py-3 lg:py-4 px-4 lg:px-6 rounded-lg font-semibold text-base lg:text-lg transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${
                  canSubmit && !isSubmitting
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 lg:h-5 lg:w-5 border-b-2 border-white"></div>
                    <span>Menyimpan...</span>
                  </div>
                ) : (
                  'Simpan Penilaian'
                )}
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
