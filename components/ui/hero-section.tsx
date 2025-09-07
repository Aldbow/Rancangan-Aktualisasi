"use client";

import { motion } from "framer-motion";
import { Building2, ArrowRight } from "lucide-react";
import { FaArrowRight } from "react-icons/fa";

export function HeroSection() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-8 md:p-12 lg:p-16 xl:p-20 shadow-2xl">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-radial from-white/15 to-transparent rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-400/25 rounded-full blur-3xl"
          animate={{
            x: [0, 60, 0, -60, 0],
            y: [0, -40, 0, 40, 0],
            scale: [1, 1.2, 1, 0.8, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-indigo-400/25 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0, 50, 0],
            y: [0, 50, 0, -50, 0],
            scale: [1, 0.8, 1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/3 left-1/3 w-32 h-32 bg-cyan-300/20 rounded-full blur-2xl"
          animate={{
            x: [0, 40, 0, -40, 0],
            y: [0, -20, 0, 20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <motion.div
              className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-gradient-to-br from-white to-blue-50 rounded-2xl flex items-center justify-center shadow-2xl"
              whileHover={{ 
                scale: 1.1, 
                rotate: [0, 5, -5, 0],
                transition: { duration: 0.5 }
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Building2 className="h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 text-blue-600" />
            </motion.div>
            <motion.div
              className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full border-4 border-white flex items-center justify-center"
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, 20, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <div className="w-3 h-3 bg-amber-600 rounded-full"></div>
            </motion.div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 bg-clip-text"
        >
          Sistem Penilaian Penyedia
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="bg-white/25 backdrop-blur-md px-8 py-3 md:px-10 md:py-4 rounded-full inline-block shadow-xl border border-white/40">
            <span className="font-semibold text-lg md:text-xl lg:text-2xl text-white">
              UKPBJ Kementerian Ketenagakerjaan RI
            </span>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="text-lg md:text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed mb-10 px-4"
        >
          Platform digital terintegrasi untuk PPK memberikan penilaian terhadap
          penyedia barang/jasa sesuai dengan standar dan kriteria yang
          ditetapkan LKPP
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-6"
        >
          <motion.button
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)"
            }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-white text-blue-700 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 group"
          >
            <span>Mulai Penilaian</span>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <FaArrowRight className="text-blue-700 group-hover:translate-x-1 transition-transform" />
            </motion.div>
          </motion.button>
          <motion.button
            whileHover={{ 
              scale: 1.05,
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)"
            }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-transparent border-2 border-white text-white font-bold rounded-2xl hover:bg-white/15 transition-all duration-300 flex items-center justify-center gap-3 group"
          >
            <span>Lihat Laporan</span>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <ArrowRight className="text-white group-hover:translate-x-1 transition-transform" />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}