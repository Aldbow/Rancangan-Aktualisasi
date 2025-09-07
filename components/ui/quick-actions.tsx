"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, BarChart3, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"
    >
      <Link href="/penilaian" className="group">
        <motion.div
          whileHover={{ 
            y: -12,
            transition: { duration: 0.3, type: "spring", stiffness: 300 }
          }}
          whileTap={{ scale: 0.98 }}
          className="h-full"
        >
          <Card className="h-full hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-blue-50/80 to-blue-100/50 dark:from-slate-800/80 dark:to-slate-700/50 border-l-4 border-l-blue-500 dark:border-l-blue-400 group-hover:border-l-8 rounded-3xl overflow-hidden relative backdrop-blur-sm">
            {/* Enhanced animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-600/5 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-blue-200/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-blue-500/30"></div>
            
            <CardContent className="p-6 lg:p-8 relative z-10 flex flex-col h-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6">
                <motion.div 
                  className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-600 dark:to-blue-700 rounded-2xl shadow-lg mb-4 sm:mb-0 group-hover:shadow-2xl transition-all duration-300 flex items-center justify-center"
                  whileHover={{ 
                    scale: 1.15,
                    rotate: [0, 5, -5, 0],
                    transition: { duration: 0.4 }
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FileText className="h-8 w-8 lg:h-10 lg:w-10 text-white" />
                </motion.div>
                <h3 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100 sm:ml-6">
                  Beri Penilaian
                </h3>
              </div>
              <p className="text-base lg:text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed flex-grow">
                Berikan penilaian terhadap penyedia barang/jasa berdasarkan
                kriteria LKPP
              </p>
              <motion.div 
                className="text-blue-700 dark:text-blue-400 font-semibold group-hover:text-blue-800 dark:group-hover:text-blue-300 flex items-center text-base lg:text-lg mt-auto"
                whileHover={{ x: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Mulai Penilaian
                <motion.span 
                  className="ml-3"
                  animate={{ x: [0, 8, 0] }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.span>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </Link>

      <Link href="/laporan" className="group">
        <motion.div
          whileHover={{ 
            y: -12,
            transition: { duration: 0.3, type: "spring", stiffness: 300 }
          }}
          whileTap={{ scale: 0.98 }}
          className="h-full"
        >
          <Card className="h-full hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-emerald-50/80 to-emerald-100/50 dark:from-slate-800/80 dark:to-slate-700/50 border-l-4 border-l-emerald-500 dark:border-l-emerald-400 group-hover:border-l-8 rounded-3xl overflow-hidden relative backdrop-blur-sm">
            {/* Enhanced animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-emerald-200/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-emerald-500/30"></div>
            
            <CardContent className="p-6 lg:p-8 relative z-10 flex flex-col h-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6">
                <motion.div 
                  className="p-4 bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-600 dark:to-emerald-700 rounded-2xl shadow-lg mb-4 sm:mb-0 group-hover:shadow-2xl transition-all duration-300 flex items-center justify-center"
                  whileHover={{ 
                    scale: 1.15,
                    rotate: [0, 5, -5, 0],
                    transition: { duration: 0.4 }
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <BarChart3 className="h-8 w-8 lg:h-10 lg:w-10 text-white" />
                </motion.div>
                <h3 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100 sm:ml-6">
                  Lihat Laporan
                </h3>
              </div>
              <p className="text-base lg:text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed flex-grow">
                Lihat laporan data penilaian penyedia secara komprehensif dan
                detail
              </p>
              <motion.div 
                className="text-emerald-700 dark:text-emerald-400 font-semibold group-hover:text-emerald-800 dark:group-hover:text-emerald-300 flex items-center text-base lg:text-lg mt-auto"
                whileHover={{ x: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Buka Laporan
                <motion.span 
                  className="ml-3"
                  animate={{ x: [0, 8, 0] }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.span>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </Link>
    </motion.div>
  );
}