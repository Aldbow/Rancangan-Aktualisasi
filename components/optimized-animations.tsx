'use client'

import { motion, AnimatePresence, MotionProps } from 'framer-motion'
import { useAnimation } from '@/components/animation-provider'
import { ReactNode, useEffect, useState } from 'react'

// Performance-optimized fade in animation
interface FadeInProps extends MotionProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 0.3, 
  className = '',
  ...props 
}: FadeInProps) {
  const { prefersReducedMotion } = useAnimation()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (prefersReducedMotion || !isMounted) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: prefersReducedMotion ? 0 : duration,
        delay: prefersReducedMotion ? 0 : delay,
        ease: "easeOut"
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Performance-optimized slide in animation
interface SlideInProps extends MotionProps {
  children: ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  distance?: number
  delay?: number
  duration?: number
  className?: string
}

export function SlideIn({ 
  children, 
  direction = 'up',
  distance = 20,
  delay = 0, 
  duration = 0.3,
  className = '',
  ...props 
}: SlideInProps) {
  const { prefersReducedMotion } = useAnimation()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Determine initial position based on direction
  const initialPosition = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance }
  }[direction]

  if (prefersReducedMotion || !isMounted) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...initialPosition }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, ...initialPosition }}
      transition={{ 
        duration: prefersReducedMotion ? 0 : duration,
        delay: prefersReducedMotion ? 0 : delay,
        ease: "easeOut"
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Performance-optimized scale animation
interface ScaleInProps extends MotionProps {
  children: ReactNode
  delay?: number
  duration?: number
  initialScale?: number
  className?: string
}

export function ScaleIn({ 
  children, 
  delay = 0, 
  duration = 0.3,
  initialScale = 0.9,
  className = '',
  ...props 
}: ScaleInProps) {
  const { prefersReducedMotion } = useAnimation()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (prefersReducedMotion || !isMounted) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: initialScale }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: initialScale }}
      transition={{ 
        duration: prefersReducedMotion ? 0 : duration,
        delay: prefersReducedMotion ? 0 : delay,
        ease: "easeOut"
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Staggered list animation
interface StaggeredAnimationProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  staggerDelay?: number
}

export function StaggeredAnimation({
  children,
  className = '',
  delay = 0,
  duration = 0.3,
  staggerDelay = 0.1
}: StaggeredAnimationProps) {
  const { prefersReducedMotion } = useAnimation()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (prefersReducedMotion || !isMounted) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={{
        hidden: { opacity: 1 },
        visible: {
          opacity: 1,
          transition: {
            delay: prefersReducedMotion ? 0 : delay,
            staggerChildren: prefersReducedMotion ? 0 : staggerDelay
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Staggered item for use within StaggeredAnimation
interface StaggeredItemProps extends MotionProps {
  children: ReactNode
  className?: string
  duration?: number
}

export function StaggeredItem({
  children,
  className = '',
  duration = 0.3,
  ...props
}: StaggeredItemProps) {
  const { prefersReducedMotion } = useAnimation()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { duration: prefersReducedMotion ? 0 : duration }
        }
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}