'use client'

import { useState, useEffect } from 'react'
import { Search, ChevronDown, Check, User } from 'lucide-react'
import { PPK } from '@/lib/google-sheets'

interface PPKSelectorProps {
  selectedPPK: PPK | null
  onSelectPPK: (ppk: PPK) => void
  placeholder?: string
  className?: string
}

export function PPKSelector({ selectedPPK, onSelectPPK, placeholder = "Pilih PPK...", className = "" }: PPKSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [ppkList, setPPKList] = useState<PPK[]>([])
  const [filteredPPK, setFilteredPPK] = useState<PPK[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch all PPK on component mount
  useEffect(() => {
    const fetchPPK = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/ppk')
        if (response.ok) {
          const data = await response.json()
          setPPKList(data)
          setFilteredPPK(data)
        }
      } catch (error) {
        console.error('Error fetching PPK:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPPK()
  }, [])

  // Filter PPK based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPPK(ppkList)
    } else {
      const filtered = ppkList.filter(ppk =>
        ppk.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ppk.nip.includes(searchQuery) ||
        ppk.satuanKerja.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ppk.eselonI.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredPPK(filtered)
    }
  }, [searchQuery, ppkList])

  const handleSelectPPK = (ppk: PPK) => {
    onSelectPPK(ppk)
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 lg:py-3 text-left border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm lg:text-base transition-all duration-200 ${
          selectedPPK ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' : 'bg-white dark:bg-slate-700'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              {selectedPPK ? (
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-100 truncate">
                    {selectedPPK.nama}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {selectedPPK.satuanKerja} - NIP: {selectedPPK.nip}
                  </div>
                </div>
              ) : (
                <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
              )}
            </div>
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-600">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Cari nama PPK, NIP, atau satuan kerja..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm"
                autoFocus
              />
            </div>
          </div>

          {/* PPK List */}
          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-sm text-muted-foreground">Memuat data PPK...</span>
              </div>
            ) : filteredPPK.length > 0 ? (
              filteredPPK.map((ppk) => (
                <button
                  key={ppk.nip}
                  type="button"
                  onClick={() => handleSelectPPK(ppk)}
                  className={`w-full px-3 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                    selectedPPK?.nip === ppk.nip ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-800 dark:text-slate-100 truncate">
                        {ppk.nama}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300 truncate">
                        {ppk.satuanKerja}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {ppk.eselonI} • NIP: {ppk.nip}
                      </div>
                    </div>
                    {selectedPPK?.nip === ppk.nip && (
                      <Check className="h-4 w-4 text-blue-500 flex-shrink-0 ml-2" />
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                {searchQuery ? 'Tidak ada PPK yang sesuai dengan pencarian' : 'Tidak ada data PPK'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
