'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AnimationContextType = {
  prefersReducedMotion: boolean;
  setPrefersReducedMotion: (prefers: boolean) => void;
  animationIntensity: 'low' | 'medium' | 'high';
  setAnimationIntensity: (intensity: 'low' | 'medium' | 'high') => void;
};

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export function AnimationProvider({ children }: { children: ReactNode }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [animationIntensity, setAnimationIntensity] = useState<'low' | 'medium' | 'high'>('high');

  useEffect(() => {
    // Check for user's reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    // Load animation intensity from localStorage
    const savedIntensity = localStorage.getItem('animationIntensity') as 'low' | 'medium' | 'high' | null;
    if (savedIntensity) {
      setAnimationIntensity(savedIntensity);
    }
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    // Save animation intensity to localStorage
    localStorage.setItem('animationIntensity', animationIntensity);
  }, [animationIntensity]);

  return (
    <AnimationContext.Provider
      value={{
        prefersReducedMotion,
        setPrefersReducedMotion,
        animationIntensity,
        setAnimationIntensity
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimation() {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
}

// Utility function to get animation config based on user preferences
export function getAnimationConfig(duration: number = 0.3, delay: number = 0) {
  const { prefersReducedMotion, animationIntensity } = useAnimation();
  
  // If user prefers reduced motion, disable animations
  if (prefersReducedMotion) {
    return {
      duration: 0,
      delay: 0,
      ease: 'linear'
    };
  }
  
  // Adjust animation intensity
  let adjustedDuration = duration;
  if (animationIntensity === 'low') {
    adjustedDuration = duration * 1.5; // Slower animations
  } else if (animationIntensity === 'high') {
    adjustedDuration = duration * 0.7; // Faster animations
  }
  
  return {
    duration: adjustedDuration,
    delay,
    ease: 'easeOut'
  };
}