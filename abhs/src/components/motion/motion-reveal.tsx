'use client';

import { useRef } from 'react';
import {
  motion,
  useInView,
  type Variant,
} from 'framer-motion';
import { useAnimationTier } from '@/hooks/useAnimationTier';

type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface MotionRevealProps {
  children: React.ReactNode;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  stagger?: number;
  threshold?: number;
  once?: boolean;
  className?: string;
}

const directionOffset: Record<RevealDirection, { x: number; y: number }> = {
  up: { x: 0, y: 40 },
  down: { x: 0, y: -40 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
  none: { x: 0, y: 0 },
};

export function MotionReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.7,
  distance,
  stagger = 0,
  threshold = 0.3,
  once = true,
  className,
}: MotionRevealProps) {
  const tier = useAnimationTier();
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once,
    amount: threshold,
  });

  if (tier === 'none') {
    return <div className={className}>{children}</div>;
  }

  const offset = directionOffset[direction];
  const actualDistance = distance ?? Math.abs(offset.x || offset.y || 40);
  const scaleX = offset.x !== 0 ? actualDistance * Math.sign(offset.x) : 0;
  const scaleY = offset.y !== 0 ? actualDistance * Math.sign(offset.y) : 0;

  const hidden: Variant = {
    opacity: 0,
    x: scaleX,
    y: scaleY,
  };

  const visible: Variant = {
    opacity: 1,
    x: 0,
    y: 0,
  };

  const reducedDuration = tier === 'reduced' ? 0.3 : duration;
  const reducedDelay = tier === 'reduced' ? delay * 0.5 : delay;
  const effectiveDirection = tier === 'reduced' ? 'none' : direction;

  const containerVariants = {
    hidden: effectiveDirection === 'none' ? { opacity: 0 } : hidden,
    visible: {
      ...(effectiveDirection === 'none' ? { opacity: 1 } : visible),
      transition: {
        duration: reducedDuration,
        delay: reducedDelay,
        ease: [0.16, 1, 0.3, 1] as const,
        staggerChildren: tier === 'reduced' ? 0 : stagger,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
    >
      {children}
    </motion.div>
  );
}

export function MotionRevealChild({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const childVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <motion.div variants={childVariants} className={className}>
      {children}
    </motion.div>
  );
}
