'use client';

import { useState, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';

export type AnimationTier = 'full' | 'reduced' | 'none';

/**
 * Determines animation intensity based on device and user preferences.
 * - "full": desktop, all animations
 * - "reduced": mobile (<=768px), fast fades only
 * - "none": prefers-reduced-motion, no animations
 */
export function useAnimationTier(): AnimationTier {
  const prefersReducedMotion = useReducedMotion();
  // Lazy init reads matchMedia at first render so the effect only handles
  // change events, not initial sync. Server returns false (no window); client
  // hydrates with the correct value.
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 768px)').matches;
  });

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)');
    function handleChange(e: MediaQueryListEvent) {
      setIsMobile(e.matches);
    }
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  if (prefersReducedMotion) return 'none';
  if (isMobile) return 'reduced';
  return 'full';
}
