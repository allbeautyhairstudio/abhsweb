'use client';

import { useEffect } from 'react';
import { motionValue, type MotionValue } from 'framer-motion';

// Module-level singleton -- one listener shared across all consumers
const cursorX = motionValue(0);
const cursorY = motionValue(0);
let listenerCount = 0;

function handleMouseMove(e: MouseEvent) {
  cursorX.set(e.clientX);
  cursorY.set(e.clientY);
}

export function useCursorPosition(): { x: MotionValue<number>; y: MotionValue<number> } {
  useEffect(() => {
    listenerCount++;
    if (listenerCount === 1) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }
    return () => {
      listenerCount--;
      if (listenerCount === 0) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  return { x: cursorX, y: cursorY };
}
