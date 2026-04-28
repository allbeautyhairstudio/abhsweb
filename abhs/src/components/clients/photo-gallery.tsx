'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Camera, Download, Trash2, X, ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Photo {
  filename: string;
  type: 'selfie' | 'inspiration' | 'other';
  url: string;
}

export function PhotoGallery({ clientId }: { clientId: number }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewPhoto, setViewPhoto] = useState<Photo | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Fetch photos on mount / when clientId changes. Inline async with a
  // cancellation flag so unmount during fetch doesn't trigger setState
  // on a stale render.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/uploads/${clientId}`);
        if (cancelled || !res.ok) {
          if (!cancelled) setLoading(false);
          return;
        }
        const data = await res.json();
        if (!cancelled) setPhotos(data.photos || []);
      } catch {
        // Silent fail — empty gallery is fine
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  async function handleDelete(photo: Photo) {
    if (!confirm(`Delete ${photo.filename}?`)) return;

    setDeleting(photo.filename);
    try {
      const res = await fetch(photo.url, { method: 'DELETE' });
      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.filename !== photo.filename));
        if (viewPhoto?.filename === photo.filename) setViewPhoto(null);
      }
    } catch {
      // Silent fail
    } finally {
      setDeleting(null);
    }
  }

  const selfies = photos.filter((p) => p.type === 'selfie');
  const inspiration = photos.filter((p) => p.type === 'inspiration');

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Client Photos</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading photos...</p>
        </CardContent>
      </Card>
    );
  }

  if (photos.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Client Photos</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-6 text-muted-foreground">
            <Camera size={24} className="mb-2 opacity-40" />
            <p className="text-sm">No photos uploaded</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader><CardTitle className="text-base">Client Photos ({photos.length})</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {selfies.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Selfie Photos</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {selfies.map((photo) => (
                  <PhotoThumbnail
                    key={photo.filename}
                    photo={photo}
                    onView={() => setViewPhoto(photo)}
                    onDelete={() => handleDelete(photo)}
                    isDeleting={deleting === photo.filename}
                  />
                ))}
              </div>
            </div>
          )}

          {inspiration.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Inspiration Photos</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {inspiration.map((photo) => (
                  <PhotoThumbnail
                    key={photo.filename}
                    photo={photo}
                    onView={() => setViewPhoto(photo)}
                    onDelete={() => handleDelete(photo)}
                    isDeleting={deleting === photo.filename}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lightbox */}
      {viewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setViewPhoto(null)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b">
              <span className="text-sm font-medium">{viewPhoto.filename}</span>
              <div className="flex items-center gap-2">
                <a
                  href={viewPhoto.url}
                  download={viewPhoto.filename}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Download photo"
                >
                  <Download size={16} />
                </a>
                <button
                  onClick={() => setViewPhoto(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <Image
              src={viewPhoto.url}
              alt={viewPhoto.filename}
              width={1600}
              height={1200}
              unoptimized
              className="max-h-[80vh] w-auto h-auto mx-auto object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}

function PhotoThumbnail({
  photo,
  onView,
  onDelete,
  isDeleting,
}: {
  photo: Photo;
  onView: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const [loadError, setLoadError] = useState(false);

  return (
    <div className="relative group aspect-square rounded-lg overflow-hidden border bg-gray-50">
      {loadError ? (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          <ImageIcon size={20} />
        </div>
      ) : (
        <Image
          src={photo.url}
          alt={photo.filename}
          fill
          unoptimized
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover cursor-pointer"
          onClick={onView}
          onError={() => setLoadError(true)}
        />
      )}

      {/* Overlay actions */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end justify-end p-1.5 opacity-0 group-hover:opacity-100">
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
          aria-label={`Delete ${photo.filename}`}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
