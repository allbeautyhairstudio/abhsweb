'use client';

import { useState, useEffect, useCallback } from 'react';
import { Camera, ImageIcon, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PhotoItem {
  filename: string;
  type: string;
  url: string;
}

interface IntakePhotoGalleryProps {
  photos: PhotoItem[];
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

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox"
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-50 text-white/80 hover:text-white transition-colors p-2 rounded-full bg-black/40 hover:bg-black/60 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close photo lightbox"
          >
            <X size={24} />
          </button>
          <div
            className="max-w-4xl max-h-[90vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxUrl}
              alt={lightboxAlt}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}
