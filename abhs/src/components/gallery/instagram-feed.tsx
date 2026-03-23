'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink, Volume2, VolumeX, ChevronDown, Loader2 } from 'lucide-react';
import type { InstagramPost } from '@/lib/instagram';
import { MotionGalleryLightbox } from '@/components/motion';
import { useAnimationTier } from '@/hooks/useAnimationTier';

// --- Video Card (autoplay on scroll, muted, respects prefers-reduced-motion) ---

function VideoCard({ post }: { post: InstagramPost }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);

  // Autoplay when visible, pause when not
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().then(() => setPlaying(true)).catch(() => {});
        } else {
          video.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted((m) => !m);
  }, []);

  function handleClick() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  return (
    <div ref={containerRef} className="relative rounded-lg overflow-hidden bg-warm-100 break-inside-avoid mb-3 sm:mb-4 group">
      <div className="relative cursor-pointer" onClick={handleClick}>
        <video
          ref={videoRef}
          src={post.media_url}
          poster={post.thumbnail_url ?? undefined}
          muted
          playsInline
          loop
          preload="metadata"
          className="w-full h-auto block rounded-lg"
        />

        {/* Mute/unmute toggle -- always visible on playing videos */}
        <button
          onClick={toggleMute}
          className={`absolute bottom-3 right-3 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all ${
            playing ? 'opacity-70 hover:opacity-100' : 'opacity-0 group-hover:opacity-70'
          }`}
          aria-label={muted ? 'Unmute video' : 'Mute video'}
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="px-3 py-2.5">
          <p className="text-xs text-warm-500 line-clamp-2 leading-relaxed">
            {post.caption}
          </p>
        </div>
      )}

      {/* Instagram link overlay -- top right */}
      <a
        href={post.permalink}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
        aria-label="View on Instagram"
        onClick={(e) => e.stopPropagation()}
      >
        <ExternalLink size={14} />
      </a>
    </div>
  );
}

// --- Image Card ---

function ImageCard({
  post,
  featured,
  onSelect,
  layoutId,
}: {
  post: InstagramPost;
  featured?: boolean;
  onSelect?: (id: string) => void;
  layoutId?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      className={`relative rounded-lg overflow-hidden bg-warm-100 break-inside-avoid mb-3 sm:mb-4 group ${featured ? '' : ''}`}
    >
      <button
        type="button"
        onClick={() => onSelect?.(post.id)}
        className="block w-full text-left focus:outline-none focus:ring-2 focus:ring-copper-500 focus:ring-offset-2 rounded-lg"
      >
        <motion.div layoutId={layoutId}>
          <Image
            src={post.media_url}
            alt={post.caption?.slice(0, 100) ?? 'Instagram post'}
            width={600}
            height={featured ? 750 : 600}
            className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </motion.div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-warm-800/0 group-hover:bg-warm-800/20 transition-colors duration-300" />

        {/* Instagram icon on hover */}
        <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink size={14} />
        </div>
      </button>

      {/* Caption */}
      {post.caption && (
        <div className="px-3 py-2.5">
          <p className="text-xs text-warm-500 line-clamp-2 leading-relaxed">
            {post.caption}
          </p>
        </div>
      )}
    </motion.div>
  );
}

// --- Main Feed Component ---

export function InstagramFeed({
  initialPosts,
  initialCursor,
}: {
  initialPosts: InstagramPost[];
  initialCursor: string | null;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const tier = useAnimationTier();

  async function loadMore() {
    if (!cursor || loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/instagram?after=${cursor}`);
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) => [...prev, ...data.posts]);
        setCursor(data.nextCursor);
      }
    } catch {
      // Silent fail -- button stays visible for retry
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Masonry grid using CSS columns */}
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4">
        {posts.map((post, i) => {
          if (post.media_type === 'VIDEO') {
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
              >
                <VideoCard post={post} />
              </motion.div>
            );
          }
          // Make every 5th image slightly "featured" for visual variety
          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
            >
              <ImageCard
                post={post}
                featured={i % 5 === 0}
                onSelect={setSelectedId}
                layoutId={tier === 'full' ? `gallery-${post.id}` : undefined}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Load more button */}
      {cursor && (
        <div className="text-center mt-10">
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-3 bg-forest-500 text-white rounded-lg hover:bg-forest-600 transition-colors font-medium min-h-[48px] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Show More
                <ChevronDown size={18} />
              </>
            )}
          </button>
        </div>
      )}

      {/* Lightbox */}
      <MotionGalleryLightbox
        items={posts}
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
        onNavigate={setSelectedId}
      />
    </div>
  );
}
