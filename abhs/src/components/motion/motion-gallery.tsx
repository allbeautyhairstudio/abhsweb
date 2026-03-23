'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAnimationTier } from '@/hooks/useAnimationTier';

interface GalleryItem {
  id: string;
  media_url: string;
  media_type: string;
  caption?: string;
  permalink: string;
}

interface MotionGalleryLightboxProps {
  items: GalleryItem[];
  selectedId: string | null;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

export function MotionGalleryLightbox({
  items,
  selectedId,
  onClose,
  onNavigate,
}: MotionGalleryLightboxProps) {
  const tier = useAnimationTier();
  const selectedIndex = items.findIndex((i) => i.id === selectedId);
  const selected = selectedIndex >= 0 ? items[selectedIndex] : null;

  const goNext = useCallback(() => {
    if (selectedIndex < items.length - 1) {
      onNavigate(items[selectedIndex + 1].id);
    }
  }, [selectedIndex, items, onNavigate]);

  const goPrev = useCallback(() => {
    if (selectedIndex > 0) {
      onNavigate(items[selectedIndex - 1].id);
    }
  }, [selectedIndex, items, onNavigate]);

  useEffect(() => {
    if (!selectedId) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    }

    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [selectedId, onClose, goNext, goPrev]);

  return (
    <AnimatePresence>
      {selected && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute inset-0 bg-warm-800/85"
            onClick={onClose}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-white/80 hover:text-white transition-colors min-w-[44px] min-h-[44px]"
            aria-label="Close lightbox"
          >
            <X size={24} />
          </button>
          {selectedIndex > 0 && (
            <button
              onClick={goPrev}
              className="absolute left-4 z-10 p-2 text-white/80 hover:text-white transition-colors min-w-[44px] min-h-[44px]"
              aria-label="Previous image"
            >
              <ChevronLeft size={28} />
            </button>
          )}
          {selectedIndex < items.length - 1 && (
            <button
              onClick={goNext}
              className="absolute right-4 z-10 p-2 text-white/80 hover:text-white transition-colors min-w-[44px] min-h-[44px]"
              aria-label="Next image"
            >
              <ChevronRight size={28} />
            </button>
          )}
          <motion.div
            key={selected.id}
            layoutId={tier === 'full' ? `gallery-${selected.id}` : undefined}
            className="relative z-10 max-w-[90vw] max-h-[85vh]"
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {selected.media_type === 'VIDEO' ? (
              <video
                src={selected.media_url}
                className="max-w-full max-h-[85vh] rounded-lg"
                controls
                autoPlay
                playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selected.media_url}
                alt={selected.caption || 'Gallery image'}
                className="max-w-full max-h-[85vh] rounded-lg object-contain"
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
