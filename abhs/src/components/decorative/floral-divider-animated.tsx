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

  // Main vine draws from left to right as you scroll
  const vineOffset = useTransform(scrollYProgress, [0.15, 0.65], [1800, 0]);
  // Tendrils and curls draw in slightly after the main vine reaches them
  const tendrilLeftOffset = useTransform(scrollYProgress, [0.2, 0.5], [400, 0]);
  const tendrilRightOffset = useTransform(scrollYProgress, [0.35, 0.6], [400, 0]);
  // Leaves unfurl after the vine passes
  const leafEarlyOffset = useTransform(scrollYProgress, [0.25, 0.45], [120, 0]);
  const leafMidOffset = useTransform(scrollYProgress, [0.35, 0.55], [120, 0]);
  const leafLateOffset = useTransform(scrollYProgress, [0.45, 0.6], [120, 0]);
  // Center bloom draws last -- the destination
  const bloomOffset = useTransform(scrollYProgress, [0.4, 0.6], [200, 0]);
  // Tiny buds pop in at the end
  const budOffset = useTransform(scrollYProgress, [0.5, 0.65], [30, 0]);

  // Static fallback for no-animation tier
  if (tier === 'none') {
    return (
      <div className={`flex items-center justify-center ${className}`} aria-hidden="true">
        <svg viewBox="0 0 800 80" fill="none" className="w-full max-w-3xl h-16 shrink-0" aria-hidden="true">
          {/* Main crawling vine */}
          <path d="M0 40 C30 40 50 32 80 28 C110 24 120 36 150 40 C180 44 190 28 220 24 C250 20 260 38 290 42 C310 45 320 35 340 30 C360 25 370 38 400 40 C430 42 440 30 460 26 C480 22 500 36 530 40 C560 44 570 30 600 26 C630 22 650 34 680 38 C710 42 730 40 760 40 L800 40" stroke="currentColor" strokeWidth="1.2" opacity="0.4" strokeLinecap="round" />
          {/* Center rose */}
          <circle cx="400" cy="40" r="6" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.45" />
          <path d="M400 32 Q398 36 400 40 Q402 36 400 32z M400 48 Q402 44 400 40 Q398 44 400 48z M392 40 Q396 38 400 40 Q396 42 392 40z M408 40 Q404 42 400 40 Q404 38 408 40z" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.35" />
        </svg>
      </div>
    );
  }

  return (
    <div ref={ref} className={`flex items-center justify-center ${className}`} aria-hidden="true">
      <svg viewBox="0 0 800 80" fill="none" className="w-full max-w-3xl h-16 shrink-0" aria-hidden="true">

        {/* ===== MAIN VINE ===== */}
        {/* The vine crawls, dips, rises, swirls -- like a real plant finding its way across */}
        <motion.path
          d="M0 40 C30 40 50 32 80 28 C110 24 120 36 150 40 C180 44 190 28 220 24 C250 20 260 38 290 42 C310 45 320 35 340 30 C360 25 370 38 400 40 C430 42 440 30 460 26 C480 22 500 36 530 40 C560 44 570 30 600 26 C630 22 650 34 680 38 C710 42 730 40 760 40 L800 40"
          stroke="currentColor"
          strokeWidth="1.2"
          opacity="0.4"
          fill="none"
          strokeLinecap="round"
          pathLength={1}
          style={tier === 'full' ? { strokeDasharray: 1, strokeDashoffset: useTransform(vineOffset, [0, 1800], [0, 1]) } : undefined}
          initial={tier === 'reduced' ? { opacity: 0 } : undefined}
          animate={tier === 'reduced' ? { opacity: 0.4 } : undefined}
          transition={tier === 'reduced' ? { duration: 0.6 } : undefined}
        />

        {/* ===== LEFT SIDE TENDRILS ===== */}
        {/* Curling tendril reaching upward from vine ~x:100 */}
        <motion.path
          d="M100 35 C105 28 115 22 110 15 C105 10 95 14 98 22 C100 26 108 24 112 20"
          stroke="currentColor"
          strokeWidth="0.8"
          opacity="0.3"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={400}
          style={tier === 'full' ? { strokeDashoffset: tendrilLeftOffset } : undefined}
        />
        {/* Spiral curl dropping below vine ~x:170 */}
        <motion.path
          d="M170 42 C175 48 185 54 180 60 C175 65 165 60 168 52 C170 46 178 50 182 55"
          stroke="currentColor"
          strokeWidth="0.7"
          opacity="0.25"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={400}
          style={tier === 'full' ? { strokeDashoffset: tendrilLeftOffset } : undefined}
        />
        {/* Small reaching tendril ~x:240 */}
        <motion.path
          d="M240 22 C245 16 252 12 248 8 C244 5 238 10 242 16"
          stroke="currentColor"
          strokeWidth="0.6"
          opacity="0.25"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={400}
          style={tier === 'full' ? { strokeDashoffset: tendrilLeftOffset } : undefined}
        />

        {/* ===== LEAVES (left side) ===== */}
        {/* Leaf unfurling at x:130 */}
        <motion.path
          d="M128 38 C122 30 116 26 112 30 C108 34 114 38 120 36 C124 34 126 36 128 38z"
          stroke="currentColor"
          strokeWidth="0.7"
          opacity="0.3"
          fill="none"
          strokeDasharray={120}
          style={tier === 'full' ? { strokeDashoffset: leafEarlyOffset } : undefined}
        />
        {/* Small leaf at x:200 */}
        <motion.path
          d="M198 28 C194 22 188 20 186 24 C184 28 190 30 194 28z"
          stroke="currentColor"
          strokeWidth="0.6"
          opacity="0.25"
          fill="none"
          strokeDasharray={120}
          style={tier === 'full' ? { strokeDashoffset: leafEarlyOffset } : undefined}
        />
        {/* Leaf pair at x:280 */}
        <motion.path
          d="M278 43 C272 48 268 52 272 56 C276 58 278 52 278 46z"
          stroke="currentColor"
          strokeWidth="0.6"
          opacity="0.25"
          fill="none"
          strokeDasharray={120}
          style={tier === 'full' ? { strokeDashoffset: leafMidOffset } : undefined}
        />
        <motion.path
          d="M284 41 C290 36 294 32 290 28 C286 26 284 32 284 38z"
          stroke="currentColor"
          strokeWidth="0.6"
          opacity="0.25"
          fill="none"
          strokeDasharray={120}
          style={tier === 'full' ? { strokeDashoffset: leafMidOffset } : undefined}
        />

        {/* ===== CENTER ROSE BLOOM ===== */}
        <motion.circle
          cx="400" cy="40" r="6"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
          opacity="0.45"
          strokeDasharray={200}
          style={tier === 'full' ? { strokeDashoffset: bloomOffset } : undefined}
        />
        {/* Petals unfurling from center */}
        <motion.path
          d="M400 32 Q398 36 400 40 Q402 36 400 32z M400 48 Q402 44 400 40 Q398 44 400 48z M392 40 Q396 38 400 40 Q396 42 392 40z M408 40 Q404 42 400 40 Q404 38 408 40z"
          stroke="currentColor"
          strokeWidth="0.6"
          fill="none"
          opacity="0.35"
          strokeDasharray={200}
          style={tier === 'full' ? { strokeDashoffset: bloomOffset } : undefined}
        />
        {/* Outer petals */}
        <motion.path
          d="M400 28 Q396 34 400 40 Q404 34 400 28z M400 52 Q404 46 400 40 Q396 46 400 52z M388 40 Q394 36 400 40 Q394 44 388 40z M412 40 Q406 44 400 40 Q406 36 412 40z"
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
          opacity="0.2"
          strokeDasharray={200}
          style={tier === 'full' ? { strokeDashoffset: bloomOffset } : undefined}
        />

        {/* ===== RIGHT SIDE TENDRILS ===== */}
        {/* Curling tendril reaching down from vine ~x:500 */}
        <motion.path
          d="M500 42 C505 50 515 56 510 63 C505 68 495 62 498 54 C500 48 510 52 514 58"
          stroke="currentColor"
          strokeWidth="0.8"
          opacity="0.3"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={400}
          style={tier === 'full' ? { strokeDashoffset: tendrilRightOffset } : undefined}
        />
        {/* Spiral reaching up from vine ~x:580 */}
        <motion.path
          d="M580 28 C585 20 595 14 590 8 C585 3 575 8 578 16 C580 22 588 18 592 12"
          stroke="currentColor"
          strokeWidth="0.7"
          opacity="0.25"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={400}
          style={tier === 'full' ? { strokeDashoffset: tendrilRightOffset } : undefined}
        />
        {/* Small curl at x:660 */}
        <motion.path
          d="M660 36 C665 30 672 26 668 22 C664 19 658 24 662 30"
          stroke="currentColor"
          strokeWidth="0.6"
          opacity="0.25"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={400}
          style={tier === 'full' ? { strokeDashoffset: tendrilRightOffset } : undefined}
        />

        {/* ===== LEAVES (right side) ===== */}
        {/* Leaf at x:530 */}
        <motion.path
          d="M532 38 C538 32 544 30 546 34 C548 38 542 40 536 38z"
          stroke="currentColor"
          strokeWidth="0.7"
          opacity="0.3"
          fill="none"
          strokeDasharray={120}
          style={tier === 'full' ? { strokeDashoffset: leafMidOffset } : undefined}
        />
        {/* Leaf pair at x:620 */}
        <motion.path
          d="M618 28 C612 22 608 18 604 22 C602 26 608 28 614 26z"
          stroke="currentColor"
          strokeWidth="0.6"
          opacity="0.25"
          fill="none"
          strokeDasharray={120}
          style={tier === 'full' ? { strokeDashoffset: leafLateOffset } : undefined}
        />
        <motion.path
          d="M624 24 C630 18 636 16 638 20 C640 24 634 26 628 24z"
          stroke="currentColor"
          strokeWidth="0.6"
          opacity="0.25"
          fill="none"
          strokeDasharray={120}
          style={tier === 'full' ? { strokeDashoffset: leafLateOffset } : undefined}
        />
        {/* Large leaf at x:700 */}
        <motion.path
          d="M698 40 C692 46 688 52 692 56 C696 58 700 52 700 44z"
          stroke="currentColor"
          strokeWidth="0.7"
          opacity="0.3"
          fill="none"
          strokeDasharray={120}
          style={tier === 'full' ? { strokeDashoffset: leafLateOffset } : undefined}
        />

        {/* ===== TINY BUDS ===== */}
        {/* Small buds scattered along the vine */}
        <motion.circle cx="80" cy="28" r="1.5" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.2"
          strokeDasharray={30} style={tier === 'full' ? { strokeDashoffset: budOffset } : undefined} />
        <motion.circle cx="310" cy="44" r="1.5" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.2"
          strokeDasharray={30} style={tier === 'full' ? { strokeDashoffset: budOffset } : undefined} />
        <motion.circle cx="460" cy="27" r="1.5" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.2"
          strokeDasharray={30} style={tier === 'full' ? { strokeDashoffset: budOffset } : undefined} />
        <motion.circle cx="730" cy="39" r="1.5" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.2"
          strokeDasharray={30} style={tier === 'full' ? { strokeDashoffset: budOffset } : undefined} />
        <motion.circle cx="155" cy="42" r="1" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.15"
          strokeDasharray={30} style={tier === 'full' ? { strokeDashoffset: budOffset } : undefined} />
        <motion.circle cx="550" cy="42" r="1" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.15"
          strokeDasharray={30} style={tier === 'full' ? { strokeDashoffset: budOffset } : undefined} />
      </svg>
    </div>
  );
}
