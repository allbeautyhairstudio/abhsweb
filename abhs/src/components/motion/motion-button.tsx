'use client';

import { motion } from 'framer-motion';
import { useAnimationTier } from '@/hooks/useAnimationTier';

interface MotionButtonProps {
  children: React.ReactNode;
  className?: string;
}

export function MotionButton({ children, className }: MotionButtonProps) {
  const tier = useAnimationTier();

  if (tier === 'none') {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      whileHover={tier === 'full' ? { y: -3, scale: 1.02 } : undefined}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
    >
      {children}
    </motion.div>
  );
}
