import React, { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
    text: 'text-blue-700 dark:text-blue-400',
    iconBg: 'from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700'
  },
  emerald: {
    border: 'border-l-emerald-600 dark:border-l-emerald-400',
    bg: 'from-white to-emerald-50 dark:from-slate-800 dark:to-slate-700',
    text: 'text-emerald-700 dark:text-emerald-400',
    iconBg: 'from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700'
  },
  indigo: {
    border: 'border-l-indigo-600 dark:border-l-indigo-400',
    bg: 'from-white to-indigo-50 dark:from-slate-800 dark:to-slate-700',
    text: 'text-indigo-700 dark:text-indigo-400',
    iconBg: 'from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700'
  },
  amber: {
    border: 'border-l-amber-600 dark:border-l-amber-400',
    bg: 'from-white to-amber-50 dark:from-slate-800 dark:to-slate-700',
    text: 'text-amber-700 dark:text-amber-400',
    iconBg: 'from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700'
  }
}

export const StatCard = memo<StatCardProps>(({ title, value, icon: Icon, color, isLoading = false }) => {
  const classes = colorClasses[color]
  
  return (
    <Card className={`border-l-4 ${classes.border} hover:shadow-2xl hover:shadow-${color}-500/20 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 bg-gradient-to-br ${classes.bg} group`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{title}</p>
            {isLoading ? (
              <div className={`text-3xl font-bold ${classes.text} animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-8 w-16`} />
            ) : (
              <p className={`text-3xl font-bold ${classes.text}`}>
                {value}
              </p>
            )}
          </div>
          <div className={`p-4 bg-gradient-to-br ${classes.iconBg} rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

StatCard.displayName = 'StatCard'
