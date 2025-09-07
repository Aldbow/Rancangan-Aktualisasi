"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  FileText,
  BarChart3,
  Users,
  Star,
  Search,
  MapPin,
  Phone,
  Calendar,
  Award,
  User,
  TrendingUp,
  Target,
  Shield,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardStats } from "@/lib/use-api-cache";
import { useSearchCache } from "@/lib/use-search-cache";
import { StatCard } from "@/components/optimized/stat-card";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Penyedia, Penilaian } from "@/lib/google-sheets";
import { StarRating } from "@/components/ui/star-rating";
import { HeroSection } from "@/components/ui/hero-section";
import { SearchSection } from "@/components/ui/search-section";
import { QuickActions } from "@/components/ui/quick-actions";
import { FeaturesSection } from "@/components/ui/features-section";
import AnimatedLayout from "@/components/ui/animated-layout";

interface DashboardStats {
  totalPenyedia: number;
  totalPenilaian: number;
  totalPPK: number;
  rataRataSkor: string;
}

interface PenyediaWithRatings extends Penyedia {
  totalPenilaian: number;
  rataRataSkor: number;
  penilaian: Penilaian[];
}

export default function HomePage() {
  const {
    data: dashboardData,
    loading: isLoading,
    error,
  } = useDashboardStats();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPenyedia, setSelectedPenyedia] =
    useState<PenyediaWithRatings | null>(null);

  // Optimized search with caching
  const searchPenyedia = useCallback(async (query: string) => {
    const response = await fetch(
      `/api/penyedia/search?q=${encodeURIComponent(query)}`
    );
    if (!response.ok) throw new Error("Search failed");
    return response.json();
  }, []);

  const {
    results: searchResults,
    isLoading: isSearching,
    search,
  } = useSearchCache(searchPenyedia, {
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
    debounceDelay: 250, // Faster response
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
          rataRataSkor: "-",
        },
        topPenyedia: [],
      };
    }

    const { penyedia, penilaian, ppk } = dashboardData;

    // Calculate stats
    const totalPenyedia = penyedia.length;
    const totalPenilaian = penilaian.length;
    const totalPPK = ppk.length; // Get PPK count from PPK sheet
    const rataRataSkor =
      penilaian.length > 0
        ? (
            penilaian.reduce((sum: number, p: any) => sum + p.skorTotal, 0) /
            penilaian.length
          ).toFixed(1)
        : "-";

    // Calculate top penyedia
    const penyediaWithRatings = penyedia
      .map((p: any) => {
        const penilaianPenyedia = penilaian.filter(
          (pnl: any) => pnl.idPenyedia === p.id
        );
        const totalPenilaianCount = penilaianPenyedia.length;
        const rataRata =
          totalPenilaianCount > 0
            ? penilaianPenyedia.reduce(
                (sum: number, pnl: any) => sum + pnl.skorTotal,
                0
              ) / totalPenilaianCount
            : 0;
        return {
          ...p,
          totalPenilaian: totalPenilaianCount,
          rataRataSkor: rataRata,
        };
      })
      .filter((p: any) => p.totalPenilaian > 0)
      .sort((a: any, b: any) => b.rataRataSkor - a.rataRataSkor)
      .slice(0, 3);

    return {
      stats: {
        totalPenyedia,
        totalPenilaian,
        totalPPK,
        rataRataSkor,
      },
      topPenyedia: penyediaWithRatings,
    };
  }, [dashboardData]);

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

  return (
    <AnimatedLayout>
      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        <SpeedInsights />
        
        {/* Hero Section */}
        <HeroSection />


        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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
            value={`${stats.rataRataSkor}${
              stats.rataRataSkor !== "-" ? "/3" : ""
            }`}
            icon={Target}
            color="amber"
            isLoading={isLoading}
          />
        </div>

        {/* Performance Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20 border-0 shadow-xl rounded-2xl overflow-hidden">
            <CardContent className="p-5 lg:p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
                  <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
                  Gambaran Kinerja
                </h2>
                <Link 
                  href="/laporan" 
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Lihat Detail
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/70 dark:bg-slate-800/70 p-4 rounded-xl">
                  <div className="flex items-center mb-2">
                    <Target className="h-5 w-5 text-emerald-600 mr-2" />
                    <h3 className="font-semibold text-slate-700 dark:text-slate-300">Tertinggi</h3>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">
                    {stats.rataRataSkor !== "-" ? parseFloat(stats.rataRataSkor).toFixed(1) : "-"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Rata-rata skor</p>
                </div>
                
                <div className="bg-white/70 dark:bg-slate-800/70 p-4 rounded-xl">
                  <div className="flex items-center mb-2">
                    <Shield className="h-5 w-5 text-amber-600 mr-2" />
                    <h3 className="font-semibold text-slate-700 dark:text-slate-300">Standar</h3>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">2.0</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Skor minimal</p>
                </div>
                
                <div className="bg-white/70 dark:bg-slate-800/70 p-4 rounded-xl">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                    <h3 className="font-semibold text-slate-700 dark:text-slate-300">Peningkatan</h3>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">+12%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Dari bulan lalu</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Search Section */}
        <SearchSection 
          searchResults={searchResults}
          isSearching={isSearching}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setSelectedPenyedia={setSelectedPenyedia}
        />
        
        {/* Provider Detail Modal */}
        <AnimatePresence>
          {selectedPenyedia && (
            <motion.div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                      Detail Penyedia
                    </h2>
                    <button
                      onClick={() => setSelectedPenyedia(null)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                      aria-label="Tutup detail penyedia"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
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
                            {getFinalEvaluationText(
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
                                    getFinalEvaluationText(penilaian.skorTotal)}
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

        {/* Quick Actions */}
        <QuickActions />

        {/* Features */}
        <FeaturesSection />
      </div>
    </AnimatedLayout>
  );
}
