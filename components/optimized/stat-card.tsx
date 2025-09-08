'use client'

import { memo } from 'react'
import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingSkeleton } from './loading-skeleton'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color: 'blue' | 'emerald' | 'indigo' | 'amber' | 'purple' | 'rose'
  isLoading?: boolean
  className?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    icon: 'text-blue-600 dark:text-blue-400',
    border: 'border-l-blue-500',
    text: 'text-blue-600 dark:text-blue-400'
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    icon: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-l-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400'
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    icon: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-l-indigo-500',
    text: 'text-indigo-600 dark:text-indigo-400'
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    icon: 'text-amber-600 dark:text-amber-400',
    border: 'border-l-amber-500',
    text: 'text-amber-600 dark:text-amber-400'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    icon: 'text-purple-600 dark:text-purple-400',
    border: 'border-l-purple-500',
    text: 'text-purple-600 dark:text-purple-400'
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    icon: 'text-rose-600 dark:text-rose-400',
    border: 'border-l-rose-500',
    text: 'text-rose-600 dark:text-rose-400'
  }
}

export const StatCard = memo<StatCardProps>(({
  title,
  value,
  icon: Icon,
  color,
  isLoading = false,
  className,
  trend
}) => {
  const colors = colorVariants[color]

  if (isLoading) {
    return (
      <Card className={cn('card-hover', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <LoadingSkeleton height="1rem" width="6rem" />
              <LoadingSkeleton height="2rem" width="4rem" />
            </div>
            <LoadingSkeleton variant="avatar" className="h-12 w-12" />
          </div>
          {trend && (
            <div className="mt-4">
              <LoadingSkeleton height="0.75rem" width="5rem" />
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(
      'card-hover border-0 shadow-lg',
      colors.border,
      'border-l-4',
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {title}
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
            </p>
          </div>
          <div className={cn(
            'p-3 rounded-xl',
            colors.bg
          )}>
            <Icon className={cn('h-6 w-6', colors.icon)} />
          </div>
        </div>
        
        {trend && (
          <div className="mt-4 flex items-center">
            <span className={cn(
              'text-sm font-medium',
              trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
              dari bulan lalu
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

StatCard.displayName = 'StatCard'