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

  // Main vine draws across full width as you scroll
  const vineOffset = useTransform(scrollYProgress, [0.1, 0.6], [3000, 0]);
  // Secondary vines and tendrils draw in waves after the main vine
  const tendril1Offset = useTransform(scrollYProgress, [0.15, 0.45], [600, 0]);
  const tendril2Offset = useTransform(scrollYProgress, [0.3, 0.55], [600, 0]);
  const tendril3Offset = useTransform(scrollYProgress, [0.4, 0.6], [600, 0]);
  // Leaves unfurl in stages
  const leafWave1 = useTransform(scrollYProgress, [0.2, 0.4], [200, 0]);
  const leafWave2 = useTransform(scrollYProgress, [0.3, 0.5], [200, 0]);
  const leafWave3 = useTransform(scrollYProgress, [0.4, 0.55], [200, 0]);
  const leafWave4 = useTransform(scrollYProgress, [0.45, 0.6], [200, 0]);
  // Blooms open last
  const bloom1Offset = useTransform(scrollYProgress, [0.3, 0.5], [300, 0]);
  const bloom2Offset = useTransform(scrollYProgress, [0.45, 0.6], [300, 0]);
  // Buds and pollen scatter at the end
  const detailOffset = useTransform(scrollYProgress, [0.5, 0.65], [60, 0]);

  if (tier === 'none') {
    return (
      <div className={`flex items-center justify-center ${className}`} aria-hidden="true">
        <svg viewBox="0 0 1200 120" fill="none" className="w-full h-24 sm:h-28 lg:h-32" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
          <path d="M0 60 C40 60 60 48 100 42 C140 36 160 52 200 58 C240 64 260 44 300 38 C340 32 360 54 400 60 C440 66 460 46 500 40 C540 34 560 52 600 58 C640 64 660 44 700 38 C740 32 760 54 800 60 C840 66 860 48 900 42 C940 36 960 52 1000 58 C1040 64 1080 52 1120 48 C1160 44 1180 54 1200 60" stroke="currentColor" strokeWidth="1.2" opacity="0.35" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  return (
    <div ref={ref} className={`flex items-center justify-center ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1200 120" fill="none" className="w-full h-24 sm:h-28 lg:h-32" aria-hidden="true" preserveAspectRatio="xMidYMid meet">

        {/* ===== MAIN VINE ===== */}
        {/* Long, sweeping, organic -- crawls across the full width with real undulation */}
        <motion.path
          d="M0 60 C40 60 60 48 100 42 C140 36 160 52 200 58 C240 64 260 44 300 38 C340 32 360 54 400 60 C440 66 460 46 500 40 C540 34 560 52 600 58 C640 64 660 44 700 38 C740 32 760 54 800 60 C840 66 860 48 900 42 C940 36 960 52 1000 58 C1040 64 1080 52 1120 48 C1160 44 1180 54 1200 60"
          stroke="currentColor" strokeWidth="1.4" opacity="0.4" fill="none" strokeLinecap="round"
          pathLength={1}
          style={tier === 'full' ? { strokeDasharray: 1, strokeDashoffset: useTransform(vineOffset, [0, 3000], [0, 1]) } : undefined}
          initial={tier === 'reduced' ? { opacity: 0 } : undefined}
          animate={tier === 'reduced' ? { opacity: 0.4 } : undefined}
          transition={tier === 'reduced' ? { duration: 0.8 } : undefined}
        />

        {/* ===== CURLING TENDRILS (left third) ===== */}
        {/* Tendril curling upward at x:80 -- reaches, spirals back */}
        <motion.path
          d="M80 42 C85 34 92 26 88 18 C84 12 76 16 78 24 C80 30 88 28 94 22 C98 18 96 12 90 10"
          stroke="currentColor" strokeWidth="0.9" opacity="0.3" fill="none" strokeLinecap="round"
          strokeDasharray={600} style={tier === 'full' ? { strokeDashoffset: tendril1Offset } : undefined}
        />
        {/* Tendril dropping below at x:180 -- swirls downward */}
        <motion.path
          d="M180 58 C186 66 194 74 190 82 C186 88 178 84 180 76 C182 68 190 72 196 78 C200 82 196 90 188 92"
          stroke="currentColor" strokeWidth="0.8" opacity="0.28" fill="none" strokeLinecap="round"
          strokeDasharray={600} style={tier === 'full' ? { strokeDashoffset: tendril1Offset } : undefined}
        />
        {/* Small curl at x:280 */}
        <motion.path
          d="M280 38 C284 30 290 24 286 18 C282 14 276 20 280 28"
          stroke="currentColor" strokeWidth="0.7" opacity="0.25" fill="none" strokeLinecap="round"
          strokeDasharray={600} style={tier === 'full' ? { strokeDashoffset: tendril1Offset } : undefined}
        />

        {/* ===== CURLING TENDRILS (middle) ===== */}
        {/* Spiral reaching up at x:480 */}
        <motion.path
          d="M480 40 C486 30 494 22 490 14 C486 8 478 12 480 20 C482 28 490 24 496 16"
          stroke="currentColor" strokeWidth="0.8" opacity="0.28" fill="none" strokeLinecap="round"
          strokeDasharray={600} style={tier === 'full' ? { strokeDashoffset: tendril2Offset } : undefined}
        />
        {/* Tendril swirling down at x:560 */}
        <motion.path
          d="M560 56 C566 64 572 72 568 80 C564 86 556 82 558 74 C560 66 568 70 574 76"
          stroke="currentColor" strokeWidth="0.7" opacity="0.25" fill="none" strokeLinecap="round"
          strokeDasharray={600} style={tier === 'full' ? { strokeDashoffset: tendril2Offset } : undefined}
        />

        {/* ===== CURLING TENDRILS (right third) ===== */}
        {/* Reaching curl at x:780 */}
        <motion.path
          d="M780 58 C786 66 794 74 790 82 C786 88 778 84 780 76 C782 70 790 72 796 80"
          stroke="currentColor" strokeWidth="0.8" opacity="0.28" fill="none" strokeLinecap="round"
          strokeDasharray={600} style={tier === 'full' ? { strokeDashoffset: tendril3Offset } : undefined}
        />
        {/* Upward spiral at x:900 */}
        <motion.path
          d="M900 42 C905 32 912 24 908 16 C904 10 896 14 898 22 C900 28 908 26 914 18"
          stroke="currentColor" strokeWidth="0.8" opacity="0.28" fill="none" strokeLinecap="round"
          strokeDasharray={600} style={tier === 'full' ? { strokeDashoffset: tendril3Offset } : undefined}
        />
        {/* Small curl at x:1050 */}
        <motion.path
          d="M1050 56 C1054 64 1060 70 1056 76 C1052 80 1046 74 1050 66"
          stroke="currentColor" strokeWidth="0.7" opacity="0.22" fill="none" strokeLinecap="round"
          strokeDasharray={600} style={tier === 'full' ? { strokeDashoffset: tendril3Offset } : undefined}
        />

        {/* ===== BOTANICAL LEAVES ===== */}
        {/* Each leaf: outer shape + midrib + 2 veins for detail */}

        {/* Leaf at x:130 (left, above vine) */}
        <motion.path d="M130 38 C122 30 118 22 122 16 C126 12 132 18 134 26 C136 32 132 36 130 38z"
          stroke="currentColor" strokeWidth="0.7" opacity="0.32" fill="none"
          strokeDasharray={200} style={tier === 'full' ? { strokeDashoffset: leafWave1 } : undefined} />
        <motion.path d="M130 38 C126 28 124 20 124 16" stroke="currentColor" strokeWidth="0.35" opacity="0.2"
          strokeDasharray={200} style={tier === 'full' ? { strokeDashoffset: leafWave1 } : undefined} />
        <motion.path d="M127 28 C129 26 131 28" stroke="currentColor" strokeWidth="0.25" opacity="0.15"
          strokeDasharray={200} style={tier === 'full' ? { strokeDashoffset: leafWave1 } : undefined} />
        <motion.path d="M126 24 C128 22 130 24" stroke="currentColor" strokeWidth="0.25" opacity="0.15"
          strokeDasharray={200} style={tier === 'full' ? { strokeDashoffset: leafWave1 } : undefined} />

        {/* Leaf at x:220 (below vine) */}
        <motion.path d="M220 62 C228 70 232 80 228 86 C224 90 218 84 216 76 C214 68 218 64 220 62z"
          stroke="currentColor" strokeWidth="0.7" opacity="0.32" fill="none"
          strokeDasharray={200} style={tier === 'full' ? { strokeDashoffset: leafWave1 } : undefined} />
        <motion.path d="M220 62 C224 72 226 82 226 86" stroke="currentColor" strokeWidth="0.35" opacity="0.2"
          strokeDasharray={200} style={tier === 'full' ? { strokeDashoffset: leafWave1 } : undefined} />

        {/* Leaf pair at x:360 (flanking vine) */}
        <motion.path d="M358 56 C350 62 344 70 348 78 C352 82 358 76 358 68 C358 62 356 58 358 56z"
          stroke="currentColor" strokeWidth="0.65" opacity="0.3" fill="none"
          strokeDasharray={200} style={tier === 'full' ? { strokeDashoffset: leafWave2 } : undefined} />
        <motion.path d="M364 56 C372 50 378 42 374 34 C370 30 364 36 364 44 C364 50 366 54 364 56z"
          stroke="currentColor" strokeWidth="0.65" opacity="0.3" fill="none"
          strokeDasharray={200} style={tier === 'full' ? { strokeDashoffset: leafWave2 } : undefined} />
        <motion.path d="M364 56 C368 46 372 38 372 34" stroke="currentColor" strokeWidth="0.3" opacity="0.18"
          strokeDasharray={200} style={tier === 'full' ? { strokeDashoffset: leafWave2 } : undefined} />

        {/* Large leaf at x:520 */}
        <motion.path d="M520 42 C512 32 506 22 510 14 C514 8 522 14 524 24 C526 32 522 38 520 42z"
          stroke="currentColor" strokeWidth="0.75" opacity="0.35" fill="none"
          strokeDasharray={200} style={tier === 'full' ? { strokeDashoffset: leafWave2 } : undefined} />
        <motion.path d="M520 42 C516 30 514 20 514 14" stroke="currentColor" strokeWidth="0.35" opacity="0.22"
          strokeDasharray={200} style={tier === 'full' ? { strokeDashoffset: leafWave2 } : undefined} />
        <motion.path d="M517 28 C519 26 521 28" stroke="currentColor" strokeWidth="0.25" opacity="0.15"
          strokeDasharray={200} style={tier === 'full' ? { strokeDashoffset: leafWave2 } : undefined} />

        {/* Leaf at x:680 (below vine) */}
        <motion.path d="M680 40 C688 48 694 58 690 66 C686 72 678 66 676 56 C674 48 678 42 680 40z"
          stroke="currentColor" strokeWidth="0.7" opacity="0.32" fill="none"
          strokeDasharray={200} style={tier === 'full' ? { strokeDashoffset: leafWave3 } : undefined} />
        <motion.path d="M680 40 C684 50 688 60 688 66" stroke="currentColor" strokeWidth="0.35" opacity="0.2"
          strokeDasharray={200} style={tier === 'full' ? { strokeDashoffset: leafWave3 } : undefined} />

        {/* Leaf pair at x:840 */}
        <motion.path d="M838 62 C830 68 826 78 830 84 C834 88 840 80 840 72 C840 66 838 64 838 62z"
          stroke="currentColor" strokeWidth="0.65" opacity="0.3" fill="none"
          strokeDasharray={200} style={tier === 'full' ? { strokeDashoffset: leafWave3 } : undefined} />
        <motion.path d="M844 62 C852 56 856 46 852 38 C848 34 842 40 842 48 C842 54 844 58 844 62z"
          stroke="currentColor" strokeWidth="0.65" opacity="0.3" fill="none"
          strokeDasharray={200} style={tier === 'full' ? { strokeDashoffset: leafWave3 } : undefined} />

        {/* Leaf at x:980 */}
        <motion.path d="M980 56 C972 64 968 74 972 80 C976 84 982 78 982 68 C982 62 980 58 980 56z"
          stroke="currentColor" strokeWidth="0.7" opacity="0.3" fill="none"
          strokeDasharray={200} style={tier === 'full' ? { strokeDashoffset: leafWave4 } : undefined} />

        {/* Small leaf at x:1100 */}
        <motion.path d="M1100 48 C1094 40 1092 32 1096 26 C1100 22 1104 28 1104 36 C1104 42 1102 46 1100 48z"
          stroke="currentColor" strokeWidth="0.6" opacity="0.28" fill="none"
          strokeDasharray={200} style={tier === 'full' ? { strokeDashoffset: leafWave4 } : undefined} />

        {/* ===== LEFT ROSE BLOOM (x:250) ===== */}
        <motion.g strokeDasharray={300} style={tier === 'full' ? { strokeDashoffset: bloom1Offset } : undefined}>
          {/* Outer petals */}
          <path d="M250 32 C244 36 240 42 242 48 C246 44 250 38 250 34z" stroke="currentColor" strokeWidth="0.7" opacity="0.35" fill="none" />
          <path d="M250 32 C256 36 260 42 258 48 C254 44 250 38 250 34z" stroke="currentColor" strokeWidth="0.7" opacity="0.35" fill="none" />
          <path d="M242 48 C244 52 248 54 250 52 C248 50 244 48 242 48z" stroke="currentColor" strokeWidth="0.6" opacity="0.3" fill="none" />
          <path d="M258 48 C256 52 252 54 250 52 C252 50 256 48 258 48z" stroke="currentColor" strokeWidth="0.6" opacity="0.3" fill="none" />
          {/* Inner spiral */}
          <path d="M248 40 C247 38 248 36 250 36.5 C252 37 253 39 252 41 C251 42 249 42 248 40z" stroke="currentColor" strokeWidth="0.7" opacity="0.45" fill="none" />
          <circle cx="250" cy="39.5" r="0.7" fill="currentColor" opacity="0.4" />
          <circle cx="251" cy="40.5" r="0.5" fill="currentColor" opacity="0.35" />
          {/* Rose leaves */}
          <path d="M238 46 C234 40 236 34 C238 40 240 44z" stroke="currentColor" strokeWidth="0.5" opacity="0.25" fill="none" />
          <path d="M262 46 C266 40 264 34 C262 40 260 44z" stroke="currentColor" strokeWidth="0.5" opacity="0.25" fill="none" />
        </motion.g>

        {/* ===== CENTER ROSE BLOOM (x:600) ===== */}
        {/* This is the centerpiece -- largest and most detailed */}
        <motion.g strokeDasharray={300} style={tier === 'full' ? { strokeDashoffset: bloom1Offset } : undefined}>
          {/* Guard petals */}
          <path d="M600 48 C592 52 586 58 588 66 C594 60 600 54 600 50z" stroke="currentColor" strokeWidth="0.8" opacity="0.38" fill="none" />
          <path d="M600 48 C608 52 614 58 612 66 C606 60 600 54 600 50z" stroke="currentColor" strokeWidth="0.8" opacity="0.38" fill="none" />
          <path d="M586 62 C588 68 594 72 600 70 C594 68 590 64 586 62z" stroke="currentColor" strokeWidth="0.7" opacity="0.32" fill="none" />
          <path d="M614 62 C612 68 606 72 600 70 C606 68 610 64 614 62z" stroke="currentColor" strokeWidth="0.7" opacity="0.32" fill="none" />
          {/* Mid petals */}
          <path d="M600 52 C596 56 594 60 596 64 C598 60 600 56 600 54z" stroke="currentColor" strokeWidth="0.75" opacity="0.42" fill="none" />
          <path d="M600 52 C604 56 606 60 604 64 C602 60 600 56 600 54z" stroke="currentColor" strokeWidth="0.75" opacity="0.42" fill="none" />
          {/* Center spiral */}
          <path d="M598 58 C597 56 598 54 600 54.5 C602 55 603 57 602 59 C601 60 599 60 598 58z" stroke="currentColor" strokeWidth="0.8" opacity="0.5" fill="none" />
          <circle cx="600" cy="57.5" r="0.8" fill="currentColor" opacity="0.45" />
          <circle cx="601" cy="58.5" r="0.5" fill="currentColor" opacity="0.38" />
          {/* Rose companion leaves */}
          <path d="M582 64 C578 58 576 50 580 44 C582 52 584 58 586 62" stroke="currentColor" strokeWidth="0.6" opacity="0.28" fill="none" />
          <path d="M582 64 C578 56 578 48 580 44" stroke="currentColor" strokeWidth="0.3" opacity="0.18" />
          <path d="M618 64 C622 58 624 50 620 44 C618 52 616 58 614 62" stroke="currentColor" strokeWidth="0.6" opacity="0.28" fill="none" />
          <path d="M618 64 C622 56 622 48 620 44" stroke="currentColor" strokeWidth="0.3" opacity="0.18" />
        </motion.g>

        {/* ===== RIGHT ROSE BUD (x:950) ===== */}
        <motion.g strokeDasharray={300} style={tier === 'full' ? { strokeDashoffset: bloom2Offset } : undefined}>
          <path d="M950 36 C946 40 944 46 948 50 C950 44 952 40 950 38z" stroke="currentColor" strokeWidth="0.7" opacity="0.35" fill="none" />
          <path d="M950 36 C954 40 956 46 952 50 C950 44 948 40 950 38z" stroke="currentColor" strokeWidth="0.7" opacity="0.35" fill="none" />
          <path d="M948 42 C948 40 949 38 950 38.5 C951 39 952 41 951 42 C950 43 949 43 948 42z" stroke="currentColor" strokeWidth="0.65" opacity="0.45" fill="none" />
          <circle cx="950" cy="41" r="0.5" fill="currentColor" opacity="0.4" />
          {/* Sepals */}
          <path d="M946 50 C944 48 942 44 944 40" stroke="currentColor" strokeWidth="0.4" opacity="0.22" strokeLinecap="round" />
          <path d="M954 50 C956 48 958 44 956 40" stroke="currentColor" strokeWidth="0.4" opacity="0.22" strokeLinecap="round" />
        </motion.g>

        {/* ===== TINY BUDS scattered along vine ===== */}
        <motion.circle cx="60" cy="50" r="2" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.22"
          strokeDasharray={60} style={tier === 'full' ? { strokeDashoffset: detailOffset } : undefined} />
        <motion.circle cx="160" cy="56" r="1.5" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.2"
          strokeDasharray={60} style={tier === 'full' ? { strokeDashoffset: detailOffset } : undefined} />
        <motion.circle cx="420" cy="62" r="2" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.22"
          strokeDasharray={60} style={tier === 'full' ? { strokeDashoffset: detailOffset } : undefined} />
        <motion.circle cx="740" cy="36" r="1.5" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.2"
          strokeDasharray={60} style={tier === 'full' ? { strokeDashoffset: detailOffset } : undefined} />
        <motion.circle cx="1020" cy="60" r="2" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.22"
          strokeDasharray={60} style={tier === 'full' ? { strokeDashoffset: detailOffset } : undefined} />
        <motion.circle cx="1150" cy="46" r="1.5" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.18"
          strokeDasharray={60} style={tier === 'full' ? { strokeDashoffset: detailOffset } : undefined} />

        {/* ===== POLLEN DOTS ===== */}
        <motion.g opacity="0.15" strokeDasharray={60} style={tier === 'full' ? { strokeDashoffset: detailOffset } : undefined}>
          <circle cx="110" cy="30" r="1" fill="currentColor" />
          <circle cx="310" cy="28" r="0.8" fill="currentColor" />
          <circle cx="440" cy="72" r="1" fill="currentColor" />
          <circle cx="550" cy="32" r="0.8" fill="currentColor" />
          <circle cx="650" cy="72" r="1" fill="currentColor" />
          <circle cx="760" cy="28" r="0.8" fill="currentColor" />
          <circle cx="870" cy="72" r="1" fill="currentColor" />
          <circle cx="1080" cy="38" r="0.8" fill="currentColor" />
        </motion.g>

      </svg>
    </div>
  );
}
