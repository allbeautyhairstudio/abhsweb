'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Camera, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PhotoItem {
  filename: string;
  type: string;
  url: string;
}

interface IntakePhotoGalleryProps {
  photos: PhotoItem[];
}

/** Lightbox with pinch-to-zoom, double-tap-to-zoom, and button zoom controls */
function LightboxModal({ url, alt, onClose }: { url: string; alt: string; onClose: () => void }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });
  const lastTap = useRef(0);
  const initialDistance = useRef(0);
  const initialScale = useRef(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  function zoomIn() {
    setScale(s => Math.min(s + 0.5, 5));
  }

  function zoomOut() {
    setScale(s => {
      const next = Math.max(s - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  }

  function resetZoom() {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }

  // Double-tap to zoom
  function handleDoubleTap() {
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2.5);
    }
  }

  // Touch handlers for pinch-to-zoom and drag
  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      // Pinch start
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      initialDistance.current = Math.hypot(dx, dy);
      initialScale.current = scale;
    } else if (e.touches.length === 1) {
      // Check for double-tap
      const now = Date.now();
      if (now - lastTap.current < 300) {
        handleDoubleTap();
        lastTap.current = 0;
        return;
      }
      lastTap.current = now;

      // Drag start (only when zoomed)
      if (scale > 1) {
        setIsDragging(true);
        dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        posStart.current = { ...position };
      }
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      // Pinch zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.hypot(dx, dy);
      const newScale = Math.min(Math.max(initialScale.current * (distance / initialDistance.current), 1), 5);
      setScale(newScale);
      if (newScale === 1) setPosition({ x: 0, y: 0 });
      e.preventDefault();
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      // Drag while zoomed
      const dx = e.touches[0].clientX - dragStart.current.x;
      const dy = e.touches[0].clientY - dragStart.current.y;
      setPosition({ x: posStart.current.x + dx, y: posStart.current.y + dy });
      e.preventDefault();
    }
  }

  function handleTouchEnd() {
    setIsDragging(false);
  }

  // Mouse drag for desktop zoom
  function handleMouseDown(e: React.MouseEvent) {
    if (scale > 1) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      posStart.current = { ...position };
    }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (isDragging && scale > 1) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPosition({ x: posStart.current.x + dx, y: posStart.current.y + dy });
    }
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Photo lightbox"
    >
      {/* Top bar with controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60">
        <div className="flex items-center gap-2">
          <button
            onClick={zoomIn}
            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Zoom in"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={zoomOut}
            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Zoom out"
          >
            <ZoomOut size={20} />
          </button>
          <button
            onClick={resetZoom}
            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Reset zoom"
          >
            <RotateCcw size={20} />
          </button>
          <span className="text-white/60 text-xs ml-2">{Math.round(scale * 100)}%</span>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Close"
        >
          <X size={24} />
        </button>
      </div>

      {/* Image area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden flex items-center justify-center touch-none select-none"
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleTap}
        onClick={(e) => {
          // Close on background click only when not zoomed
          if (scale === 1 && e.target === containerRef.current) onClose();
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={alt}
          className="max-w-full max-h-full object-contain pointer-events-none"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease',
          }}
          draggable={false}
        />
      </div>

      {/* Hint text */}
      {scale === 1 && (
        <div className="text-center py-2 text-white/40 text-xs">
          Pinch or double-tap to zoom -- drag to pan
        </div>
      )}
    </div>
  );
}

export function IntakePhotoGallery({ photos }: IntakePhotoGalleryProps) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState('');

  const closeLightbox = useCallback(() => {
    setLightboxUrl(null);
    setLightboxAlt('');
  }, []);

  useEffect(() => {
    if (!lightboxUrl) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeLightbox();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lightboxUrl, closeLightbox]);

  const selfies = photos.filter((p) => p.type === 'selfie');
  const inspiration = photos.filter((p) => p.type === 'inspiration');

  function openLightbox(photo: PhotoItem) {
    const label = photo.type === 'selfie' ? 'Selfie photo' : 'Inspiration photo';
    setLightboxUrl(photo.url);
    setLightboxAlt(`${label}: ${photo.filename}`);
  }

  function PhotoGrid({ items, label }: { items: PhotoItem[]; label: string }) {
    if (items.length === 0) return null;

    return (
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">{label}</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map((photo) => (
            <button
              key={photo.filename}
              onClick={() => openLightbox(photo)}
              className="group relative aspect-square rounded-lg overflow-hidden border border-border hover:border-brand-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2"
              aria-label={`View ${photo.type === 'selfie' ? 'selfie' : 'inspiration'} photo: ${photo.filename}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={`${photo.type === 'selfie' ? 'Client selfie' : 'Inspiration'} photo`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Camera size={16} className="text-brand-500" />
            Client Photos
            <span className="text-xs font-normal text-muted-foreground">
              ({photos.length} {photos.length === 1 ? 'photo' : 'photos'})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <PhotoGrid
            items={selfies}
            label={`Selfie Photos (${selfies.length})`}
          />
          <PhotoGrid
            items={inspiration}
            label={`Inspiration Photos (${inspiration.length})`}
          />
        </CardContent>
      </Card>

      {/* Lightbox Modal with Zoom */}
      {lightboxUrl && (
        <LightboxModal
          url={lightboxUrl}
          alt={lightboxAlt}
          onClose={closeLightbox}
        />
      )}
    </>
  );
}
