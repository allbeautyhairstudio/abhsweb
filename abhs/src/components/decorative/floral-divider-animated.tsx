'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAnimationTier } from '@/hooks/useAnimationTier';

interface AnimatedDividerProps {
  className?: string;
}

export function FloralDividerAnimated({ className = '' }: AnimatedDividerProps) {
  const tier = useAnimationTier();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // All hooks at top level -- NEVER inside JSX
  const vineOffset = useTransform(scrollYProgress, [0.2, 0.7], [600, 0]);
  const leafOffset = useTransform(scrollYProgress, [0.3, 0.6], [40, 0]);
  const bloomOffset = useTransform(scrollYProgress, [0.35, 0.55], [32, 0]);
  const petalOffset = useTransform(scrollYProgress, [0.4, 0.6], [80, 0]);

  if (tier === 'none') {
    return (
      <div className={`flex items-center justify-center ${className}`} aria-hidden="true">
        <div className="h-px flex-1 bg-current opacity-30" />
        <svg viewBox="0 0 600 40" fill="none" className="w-full max-w-2xl h-10 shrink-0" aria-hidden="true">
          <path d="M0 20 Q75 20 120 14 Q160 8 200 14 Q240 20 300 20 Q360 20 400 14 Q440 8 480 14 Q525 20 600 20" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <circle cx="300" cy="20" r="5" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.5" />
          <path d="M300 13 Q298 16 300 20 Q302 16 300 13z" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.4" />
          <path d="M300 27 Q302 24 300 20 Q298 24 300 27z" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.4" />
        </svg>
        <div className="h-px flex-1 bg-current opacity-30" />
      </div>
    );
  }

  return (
    <div ref={ref} className={`flex items-center justify-center ${className}`} aria-hidden="true">
      <div className="h-px flex-1 bg-current opacity-30" />
      <svg viewBox="0 0 600 40" fill="none" className="w-full max-w-2xl h-10 shrink-0" aria-hidden="true">
        {/* Main vine -- single continuous path */}
        <motion.path
          d="M0 20 Q75 20 120 14 Q160 8 200 14 Q240 20 300 20 Q360 20 400 14 Q440 8 480 14 Q525 20 600 20"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.4"
          fill="none"
          strokeDasharray={600}
          style={tier === 'full' ? { strokeDashoffset: vineOffset } : undefined}
          initial={tier === 'reduced' ? { opacity: 0 } : undefined}
          animate={tier === 'reduced' ? { opacity: 0.4 } : undefined}
          transition={tier === 'reduced' ? { duration: 0.5 } : undefined}
        />
        {/* Left leaf */}
        <motion.path
          d="M150 14 Q145 6 155 3 Q160 9 150 14z"
          stroke="currentColor"
          strokeWidth="0.7"
          fill="none"
          opacity="0.3"
          strokeDasharray={40}
          style={tier === 'full' ? { strokeDashoffset: leafOffset } : undefined}
        />
        {/* Right leaf */}
        <motion.path
          d="M450 14 Q455 6 445 3 Q440 9 450 14z"
          stroke="currentColor"
          strokeWidth="0.7"
          fill="none"
          opacity="0.3"
          strokeDasharray={40}
          style={tier === 'full' ? { strokeDashoffset: leafOffset } : undefined}
        />
        {/* Center bloom */}
        <motion.circle
          cx="300" cy="20" r="5"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
          opacity="0.5"
          strokeDasharray={32}
          style={tier === 'full' ? { strokeDashoffset: bloomOffset } : undefined}
        />
        {/* Center petals */}
        <motion.path
          d="M300 13 Q298 16 300 20 Q302 16 300 13z M300 27 Q302 24 300 20 Q298 24 300 27z M293 20 Q296 18 300 20 Q296 22 293 20z M307 20 Q304 22 300 20 Q304 18 307 20z"
          stroke="currentColor"
          strokeWidth="0.6"
          fill="none"
          opacity="0.4"
          strokeDasharray={80}
          style={tier === 'full' ? { strokeDashoffset: petalOffset } : undefined}
        />
      </svg>
      <div className="h-px flex-1 bg-current opacity-30" />
    </div>
  );
}
