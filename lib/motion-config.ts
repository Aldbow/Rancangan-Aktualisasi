// Framer Motion configuration for performance optimization
import { domMax } from 'framer-motion'

// Lazy load Framer Motion features only when needed
export const motionConfig = {
  // Reduce motion for users who prefer it
  reducedMotion: {
    enabled: true
  },
  
  // Optimize animations for performance
  features: {
    // Only enable features we actually use
    dom: domMax,
    
    // Animation timing
    time: {
      // Use performance.now() for smoother animations
      usePerformanceNow: true
    }
  },
  
  // Animation defaults
  defaults: {
    // Reduce animation duration for better performance
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
}