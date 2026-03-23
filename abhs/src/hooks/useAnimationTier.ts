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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)');
    setIsMobile(mql.matches);

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
