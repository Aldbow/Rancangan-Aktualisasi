"use client";

import { motion } from "framer-motion";
import { Search, Users, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function FeaturesSection() {
  const features = [
    {
      icon: Search,
      title: "Pencarian Cepat",
      description: "Cari penyedia dengan mudah menggunakan fitur pencarian yang canggih dan responsif",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      icon: Users,
      title: "Penilaian PPK",
      description: "PPK dapat memberikan penilaian untuk penyedia dengan mudah dan cepat.",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20"
    },
    {
      icon: BarChart3,
      title: "Laporan Real-time",
      description: "Data tersinkronisasi secara real-time dengan Google Spreadsheet untuk akurasi maksimal",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
    >
      <Card className="bg-gradient-to-br from-slate-50/80 to-white/50 dark:from-slate-800/80 dark:to-slate-700/50 border-0 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm">
        <CardContent className="p-6 sm:p-8 lg:p-12">
          <div className="text-center mb-10 lg:mb-16 px-4 sm:px-6">
            <motion.h2 
              className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-700 to-blue-600 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent mb-4 lg:mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Fitur Utama
            </motion.h2>
            <motion.p 
              className="text-slate-600 dark:text-slate-300 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Solusi lengkap untuk penilaian penyedia yang efisien dan terintegrasi
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              
              return (
                <motion.div
                  key={index}
                  className="text-center group"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 * (index + 3), duration: 0.6 }}
                  whileHover={{ 
                    y: -15,
                    transition: { duration: 0.3, type: "spring", stiffness: 300 }
                  }}
                  transition={{ 
                    y: { duration: 0.2, type: "spring", stiffness: 300 }
                  }}
                >
                  <div className="relative h-full">
                    <motion.div 
                      className={`p-6 lg:p-8 ${feature.bgColor} rounded-3xl w-full mx-auto mb-6 lg:mb-8 shadow-lg group-hover:shadow-2xl transition-all duration-500 relative overflow-hidden`}
                      whileHover={{
                        scale: 1.05,
                        transition: { duration: 0.3 }
                      }}
                    >
                      {/* Background glow effect */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-3xl blur-2xl transition-opacity duration-500`}></div>
                      
                      {/* Icon container with enhanced animation */}
                      <motion.div 
                        className={`p-5 lg:p-6 bg-gradient-to-br ${feature.color} rounded-2xl w-fit mx-auto mb-6 shadow-lg group-hover:shadow-2xl transition-all duration-300 relative z-10`}
                        whileHover={{ 
                          scale: 1.2,
                          rotate: [0, 10, -10, 0],
                          transition: { duration: 0.5 }
                        }}
                      >
                        <Icon className="h-10 w-10 lg:h-12 lg:w-12 text-white" />
                      </motion.div>
                      
                      {/* Decorative elements */}
                      <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </motion.div>
                    
                    <motion.h3 
                      className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-white mb-4 lg:mb-5"
                      whileHover={{ 
                        scale: 1.05,
                        color: feature.color.includes("blue") ? "#3b82f6" : feature.color.includes("emerald") ? "#10b981" : "#8b5cf6"
                      }}
                    >
                      {feature.title}
                    </motion.h3>
                    
                    <p className="text-base lg:text-lg text-slate-600 dark:text-slate-300 leading-relaxed px-2">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}