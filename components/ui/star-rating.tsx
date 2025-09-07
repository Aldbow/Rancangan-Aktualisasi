import { Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface StarRatingProps {
  rating: number
  maxStars?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  className?: string
}

export function StarRating({ 
  rating, 
  maxStars = 5, 
  size = 'md', 
  showValue = false,
  className = '' 
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  const renderStars = () => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <motion.div
          key={`full-${i}`} 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
        >
          <Star 
            className={`${sizeClasses[size]} text-yellow-500 fill-yellow-500`} 
          />
        </motion.div>
      )
    }

    // Half star
    if (hasHalfStar && fullStars < maxStars) {
      stars.push(
        <div key="half" className="relative">
          <Star className={`${sizeClasses[size]} text-gray-300`} />
          <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: fullStars * 0.1, type: "spring", stiffness: 300 }}
            >
              <Star className={`${sizeClasses[size]} text-yellow-500 fill-yellow-500`} />
            </motion.div>
          </div>
        </div>
      )
    }

    // Empty stars
    const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <motion.div
          key={`empty-${i}`} 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: (fullStars + (hasHalfStar ? 1 : 0) + i) * 0.1, type: "spring", stiffness: 300 }}
        >
          <Star 
            className={`${sizeClasses[size]} text-gray-300`} 
          />
        </motion.div>
      )
    }

    return stars
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="flex items-center space-x-0.5">
        {renderStars()}
      </div>
      {showValue && (
        <motion.span 
          className={`font-medium text-gray-700 dark:text-gray-300 ${textSizeClasses[size]}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {rating.toFixed(1)}
        </motion.span>
      )}
    </div>
  )
}
