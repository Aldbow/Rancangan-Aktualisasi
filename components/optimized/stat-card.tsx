import React, { memo, useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { motion, useAnimation } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color: 'blue' | 'emerald' | 'indigo' | 'amber'
  isLoading?: boolean
}

const colorClasses = {
  blue: {
    border: 'border-l-blue-600 dark:border-l-blue-400',
    bg: 'from-white to-blue-50 dark:from-slate-800 dark:to-slate-700',
    text: 'text-blue-800 dark:text-blue-300',
    iconBg: 'from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700',
    glow: 'shadow-blue-500/50'
  },
  emerald: {
    border: 'border-l-emerald-600 dark:border-l-emerald-400',
    bg: 'from-white to-emerald-50 dark:from-slate-800 dark:to-slate-700',
    text: 'text-emerald-800 dark:text-emerald-300',
    iconBg: 'from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700',
    glow: 'shadow-emerald-500/50'
  },
  indigo: {
    border: 'border-l-purple-600 dark:border-l-purple-400',
    bg: 'from-white to-purple-100 dark:from-slate-800 dark:to-purple-900/30',
    text: 'text-purple-800 dark:text-purple-300',
    iconBg: 'from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700',
    glow: 'shadow-purple-500/30'
  },
  amber: {
    border: 'border-l-amber-600 dark:border-l-amber-400',
    bg: 'from-white to-amber-50 dark:from-slate-800 dark:to-slate-700',
    text: 'text-amber-800 dark:text-amber-300',
    iconBg: 'from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700',
    glow: 'shadow-amber-500/50'
  }
}

export const StatCard = memo<StatCardProps>(({ title, value, icon: Icon, color, isLoading = false }) => {
  const classes = colorClasses[color]
  const [mounted, setMounted] = useState(false)
  
  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering animations until mounted
  if (!mounted) {
    return (
      <Card className={`border-l-4 ${classes.border} bg-gradient-to-br ${classes.bg} rounded-2xl`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {title}
              </p>
              {isLoading ? (
                <div className="text-3xl font-bold animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-8 w-16" />
              ) : (
                <div className={`text-3xl font-bold ${classes.text} min-h-[2rem] flex items-center`}>
                  {value}
                </div>
              )}
            </div>
            <div className={`p-4 bg-gradient-to-br ${classes.iconBg} rounded-xl shadow-lg flex items-center justify-center`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ 
        y: -12,
        transition: { duration: 0.3, type: "spring", stiffness: 300 }
      }}
      className="group"
      suppressHydrationWarning
    >
      <Card className={`border-l-4 ${classes.border} hover:shadow-2xl transition-all duration-500 bg-gradient-to-br ${classes.bg} group overflow-hidden relative rounded-2xl`}>
        {/* Enhanced animated background on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
        
        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${classes.glow}`}></div>
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <motion.p 
                className="text-sm font-medium text-slate-600 dark:text-slate-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {title}
              </motion.p>
              {isLoading ? (
                <div className="text-3xl font-bold animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-8 w-16" />
              ) : (
                <div 
                  className={`text-3xl font-bold ${classes.text} min-h-[2rem] flex items-center`}
                  style={{ 
                    color: 'inherit',
                    display: 'block',
                    visibility: 'visible'
                  }}
                >
                  {value}
                </div>
              )}
            </div>
            <motion.div 
              className={`p-4 bg-gradient-to-br ${classes.iconBg} rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 flex items-center justify-center`}
              whileHover={{ 
                scale: 1.15,
                rotate: [0, 5, -5, 0],
                transition: { duration: 0.4 }
              }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
            >
              <Icon className="h-6 w-6 text-white" />
            </motion.div>
          </div>
          
          {/* Bottom accent bar */}
          <motion.div 
            className={`h-1 w-full mt-4 rounded-full bg-gradient-to-r ${classes.iconBg} opacity-0 group-hover:opacity-100`}
            initial={{ width: "0%" }}
            whileHover={{ width: "100%" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </CardContent>
      </Card>
    </motion.div>
  )
})

StatCard.displayName = 'StatCard'