'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAnimationTier } from '@/hooks/useAnimationTier';

interface MotionParallaxProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export function MotionParallax({
  children,
  speed = 0.3,
  className,
}: MotionParallaxProps) {
  const tier = useAnimationTier();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed]);

  if (tier !== 'full') {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
