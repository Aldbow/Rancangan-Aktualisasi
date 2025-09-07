"use client";

import { motion } from "framer-motion";
import { Building2, ArrowRight, ShieldCheck, TrendingUp, Award, Star, Zap, Globe } from "lucide-react";
import { FaArrowRight } from "react-icons/fa";

export function HeroSection() {
  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6 md:p-10 lg:p-14 xl:p-20 shadow-2xl">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        {/* Large gradient circle */}
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-radial from-blue-500/20 via-indigo-500/10 to-transparent rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Floating elements */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-400/15 rounded-full blur-3xl"
          animate={{
            x: [0, 60, 0, -60, 0],
            y: [0, -40, 0, 40, 0],
            scale: [1, 1.2, 1, 0.8, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-indigo-400/15 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0, 50, 0],
            y: [0, 50, 0, -50, 0],
            scale: [1, 0.8, 1, 1.2, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute top-1/3 left-1/3 w-32 h-32 bg-cyan-300/10 rounded-full blur-2xl"
          animate={{
            x: [0, 40, 0, -40, 0],
            y: [0, -20, 0, 20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Geometric shapes */}
        <motion.div
          className="absolute top-1/2 left-1/4 w-16 h-16 border border-blue-400/20 rotate-45"
          animate={{
            rotate: [45, 135, 225, 315, 405],
            scale: [1, 1.2, 1, 0.8, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute bottom-1/3 right-1/3 w-12 h-12 bg-indigo-500/20 rounded-full"
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20"
            >
              <ShieldCheck className="h-4 w-4 text-blue-300" />
              <span className="text-blue-100 text-sm font-medium">Sistem Terintegrasi UKPBJ Kemnaker</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white mb-6 leading-tight md:leading-tight relative z-20 tracking-tight"
            >
              <span className="block mb-2">Penilaian Penyedia</span>
              <span className="block bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                Barang/Jasa
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100 max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-10 font-body"
            >
              Platform digital terintegrasi untuk PPK memberikan penilaian terhadap penyedia barang/jasa sesuai dengan standar dan kriteria yang ditetapkan LKPP
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)"
                }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 group text-sm sm:text-base"
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
                  <FaArrowRight className="text-white group-hover:translate-x-1 transition-transform" />
                </motion.div>
              </motion.button>
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)"
                }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 sm:px-8 sm:py-4 bg-transparent border-2 border-white/30 text-white font-bold rounded-2xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-3 group text-sm sm:text-base"
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
          </motion.div>
          
          {/* Visual Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="hidden lg:flex justify-center"
          >
            <div className="relative">
              <motion.div
                className="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-white/20 to-blue-50/10 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-sm border border-white/20"
                whileHover={{ 
                  scale: 1.05, 
                  rotate: [0, 5, -5, 0],
                  transition: { duration: 0.5 }
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <motion.div 
                    className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Building2 className="h-8 w-8 md:h-10 md:w-10 text-white" />
                  </motion.div>
                  <motion.div 
                    className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-xl flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1 }}
                  >
                    <ShieldCheck className="h-8 w-8 md:h-10 md:w-10 text-white" />
                  </motion.div>
                  <motion.div 
                    className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-xl flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1 }}
                  >
                    <TrendingUp className="h-8 w-8 md:h-10 md:w-10 text-white" />
                  </motion.div>
                  <motion.div 
                    className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-xl flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Award className="h-8 w-8 md:h-10 md:w-10 text-white" />
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Floating icons */}
              <motion.div
                className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center shadow-xl"
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, 10, 0],
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Star className="h-10 w-10 text-white" />
              </motion.div>
              
              <motion.div
                className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center shadow-xl"
                animate={{ 
                  y: [0, 15, 0],
                  rotate: [0, -10, 0],
                }}
                transition={{ 
                  duration: 3.5, 
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                <Zap className="h-10 w-10 text-white" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}