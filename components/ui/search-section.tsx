"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  FileText, 
  MapPin, 
  Search as SearchIcon,
  Calendar,
  User,
  Award,
  Phone
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";

interface Penyedia {
  id: string;
  namaPerusahaan: string;
  npwp: string;
  alamat: string;
  jenisUsaha: string;
  kontak: string;
  tanggalRegistrasi: string;
  totalPenilaian: number;
  rataRataSkor: number;
  penilaian: any[];
}

interface SearchSectionProps {
  searchResults: Penyedia[];
  isSearching: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setSelectedPenyedia: (penyedia: Penyedia | null) => void;
}

// Map LKPP score (1-3) to 5-star rating
const mapScoreToStars = (score: number) => {
  if (score === 0) return 0;
  if (score >= 1 && score < 2) return 2; // Cukup = 2 stars
  if (score >= 2 && score < 3) return 4; // Baik = 4 stars
  if (score === 3) return 5; // Sangat Baik = 5 stars
  return 1; // fallback
};

// Get final evaluation text
const getFinalEvaluationText = (score: number) => {
  if (score === 3) return "Sangat Baik";
  if (score >= 2 && score < 3) return "Baik";
  if (score >= 1 && score < 2) return "Cukup";
  if (score === 0) return "Buruk";
  return "Cukup"; // fallback
};

// Get rating color based on LKPP scale (1-3)
const getRatingColor = (rating: number) => {
  if (rating >= 2.5) return "text-green-600 bg-green-100";
  if (rating >= 2.0) return "text-blue-600 bg-blue-100";
  if (rating >= 1.0) return "text-yellow-600 bg-yellow-100";
  return "text-red-600 bg-red-100";
};

export function SearchSection({ 
  searchResults, 
  isSearching, 
  searchQuery, 
  setSearchQuery,
  setSelectedPenyedia
}: SearchSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Card className="border-2 border-dashed border-blue-300/50 bg-gradient-to-br from-white/80 to-blue-50/50 dark:from-slate-800/80 dark:to-slate-900/50 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm">
        <CardContent className="p-6 md:p-8">
          <div className="text-center mb-8">
            <motion.h2 
              className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Cari Penyedia
            </motion.h2>
            <motion.p 
              className="text-slate-600 dark:text-slate-300 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Cari penyedia berdasarkan nama perusahaan atau NPWP dengan
              pencarian yang cepat dan akurat
            </motion.p>
          </div>

          {/* Enhanced Search Input - Full Width */}
          <div className="relative mb-8 group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none z-10">
              <SearchIcon className="h-6 w-6 text-blue-500 group-focus-within:text-blue-600 transition-colors" />
            </div>
            <motion.input
              type="text"
              placeholder="Ketik nama perusahaan atau NPWP untuk mencari..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-6 py-5 text-lg border-2 border-blue-200/50 dark:border-blue-700/50 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 dark:bg-slate-800/50 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-lg hover:shadow-xl backdrop-blur-sm bg-white/70"
              whileFocus={{ 
                scale: 1.01,
                boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.25)"
              }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-6 flex items-center">
                <motion.div 
                  className="rounded-full h-6 w-6 border-b-2 border-blue-600"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
            )}
          </div>

          {/* Enhanced Search Results */}
          <AnimatePresence mode="wait">
            {!isSearching && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent rounded-lg"
              >
                <motion.div 
                  className="text-sm text-slate-600 dark:text-slate-400 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  Ditemukan {searchResults.length} penyedia
                </motion.div>
                
                {searchResults.map((penyedia, index) => (
                  <motion.div
                    key={penyedia.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.01,
                      y: -5,
                      transition: { duration: 0.2, type: "spring", stiffness: 300 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedPenyedia(penyedia)}
                    className="group p-6 border-2 border-slate-200/50 dark:border-slate-700/50 rounded-2xl cursor-pointer hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 bg-white/80 dark:bg-slate-800/80 shadow-md hover:shadow-xl backdrop-blur-sm"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-3">
                          <motion.div 
                            className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors"
                            whileHover={{ 
                              scale: 1.1,
                              rotate: [0, 5, -5, 0]
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                          </motion.div>
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
                            <FileText className="h-4 w-4" aria-hidden="true" />
                            NPWP: {penyedia.npwp}
                          </span>
                          {penyedia.alamat && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" aria-hidden="true" />
                              {penyedia.alamat.substring(0, 50)}
                              {penyedia.alamat.length > 50 ? "..." : ""}
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
                          <motion.div
                            className={`text-sm px-3 py-1 rounded-full font-medium ${getRatingColor(
                              penyedia.rataRataSkor
                            )}`}
                            whileHover={{ 
                              scale: 1.05,
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                            }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            {getFinalEvaluationText(penyedia.rataRataSkor)}
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {!isSearching && searchResults.length === 0 && searchQuery && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="text-center py-12"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                </motion.div>
                <p className="text-slate-600 dark:text-slate-300 text-lg">
                  Tidak ada penyedia yang ditemukan
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                  Coba dengan kata kunci lain
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}