import { Star } from 'lucide-react'

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
        <Star 
          key={`full-${i}`} 
          className={`${sizeClasses[size]} text-yellow-500 fill-yellow-500`} 
        />
      )
    }

    // Half star
    if (hasHalfStar && fullStars < maxStars) {
      stars.push(
        <div key="half" className="relative">
          <Star className={`${sizeClasses[size]} text-gray-300`} />
          <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <Star className={`${sizeClasses[size]} text-yellow-500 fill-yellow-500`} />
          </div>
        </div>
      )
    }

    // Empty stars
    const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star 
          key={`empty-${i}`} 
          className={`${sizeClasses[size]} text-gray-300`} 
        />
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
        <span className={`font-medium text-gray-700 dark:text-gray-300 ${textSizeClasses[size]}`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
