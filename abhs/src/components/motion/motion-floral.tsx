'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useAnimationTier } from '@/hooks/useAnimationTier';

interface MotionFloralProps {
  children: React.ReactNode;
  className?: string;
}

export function MotionFloral({
  children,
  className,
}: MotionFloralProps) {
  const tier = useAnimationTier();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  if (tier === 'none') {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
      transition={{
        opacity: { duration: 0.6 },
        scale: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
      }}
    >
      {children}
    </motion.div>
  );
}
