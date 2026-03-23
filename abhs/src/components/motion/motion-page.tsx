'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useAnimationTier } from '@/hooks/useAnimationTier';

type PageTransition = {
  initial: Record<string, number>;
  animate: Record<string, number>;
  transition: Record<string, unknown>;
};

const routeTransitions: Record<string, PageTransition> = {
  '/': {
    initial: { opacity: 0, scale: 0.97 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
  '/gallery': {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
  '/philosophy': {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
  '/faq': {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
  '/newclientform': {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
  '/book': {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
  '/about': {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const defaultTransition: PageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.2, ease: [0, 0, 0.2, 1] },
};

interface MotionPageProps {
  children: React.ReactNode;
  className?: string;
}

export function MotionPage({ children, className }: MotionPageProps) {
  const tier = useAnimationTier();
  const pathname = usePathname();

  if (tier === 'none') {
    return <div className={className}>{children}</div>;
  }

  if (tier === 'reduced') {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    );
  }

  const config = routeTransitions[pathname] ?? defaultTransition;

  return (
    <motion.div
      className={className}
      initial={config.initial}
      animate={config.animate}
      transition={config.transition}
    >
      {children}
    </motion.div>
  );
}
