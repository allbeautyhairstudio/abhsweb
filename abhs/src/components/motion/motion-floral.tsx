'use client';

import { useRef, useState, useEffect } from 'react';
import {
  motion,
  useInView,
  type MotionValue,
} from 'framer-motion';
import { useAnimationTier } from '@/hooks/useAnimationTier';
import { useCursorPosition } from '@/hooks/useCursorPosition';

interface MotionFloralProps {
  children: React.ReactNode;
  drawIn?: boolean;
  drawDuration?: number;
  breathing?: boolean;
  cursorResponse?: boolean;
  className?: string;
}

function useDistanceFromElement(
  ref: React.RefObject<HTMLElement | null>,
  cursorX: MotionValue<number>,
  cursorY: MotionValue<number>
) {
  const [distance, setDistance] = useState(Infinity);

  useEffect(() => {
    function update() {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = cursorX.get() - cx;
      const dy = cursorY.get() - cy;
      setDistance(Math.sqrt(dx * dx + dy * dy));
    }

    const unsubX = cursorX.on('change', update);
    const unsubY = cursorY.on('change', update);
    return () => {
      unsubX();
      unsubY();
    };
  }, [ref, cursorX, cursorY]);

  return distance;
}

export function MotionFloral({
  children,
  drawIn = true,
  drawDuration = 1.2,
  breathing = true,
  cursorResponse = true,
  className,
}: MotionFloralProps) {
  const tier = useAnimationTier();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const cursor = useCursorPosition();
  const distance = useDistanceFromElement(ref, cursor.x, cursor.y);

  // No animation: render children static
  if (tier === 'none') {
    return <div className={className}>{children}</div>;
  }

  // Mobile: simple fade-in with bloom scale
  if (tier === 'reduced') {
    return (
      <motion.div
        ref={ref}
        className={className}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.div>
    );
  }

  // Desktop: full animation with mutually exclusive breathing/cursor
  const isNear = cursorResponse && distance < 200;
  const cursorInfluence = isNear ? Math.max(0, 1 - distance / 200) : 0;
  const cursorRotate = cursorInfluence * 5;
  const cursorScale = 1 + cursorInfluence * 0.05;

  // Cursor response overrides breathing when cursor is near
  const animateProps = isInView
    ? isNear
      ? {
          opacity: 1,
          scale: cursorScale,
          rotate: cursorRotate,
        }
      : breathing
        ? {
            opacity: 1,
            scale: 1,
            rotate: [0, 1.5, 0, -1.5, 0],
          }
        : { opacity: 1, scale: 1 }
    : { opacity: 0, scale: 0.6 };

  const transitionProps = isNear
    ? {
        opacity: { duration: 0.6 },
        rotate: { type: 'spring' as const, damping: 20, stiffness: 150 },
        scale: { type: 'spring' as const, damping: 20, stiffness: 150 },
      }
    : breathing
      ? {
          opacity: { duration: 0.6 },
          rotate: {
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut' as const,
            delay: drawDuration,
          },
          scale: { duration: 0.6 },
        }
      : { opacity: { duration: 0.6 }, scale: { duration: 0.6 } };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={animateProps}
      transition={transitionProps}
      style={{ willChange: breathing ? 'transform' : undefined }}
    >
      {children}
    </motion.div>
  );
}
