import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'See Karli\'s latest work — cuts, color, and transformations from All Beauty Hair Studio.',
};
import { Instagram } from 'lucide-react';
import { getInstagramPosts } from '@/lib/instagram';
import { InstagramFeed } from '@/components/gallery/instagram-feed';
import { FloralBloom, FloralDivider } from '@/components/decorative/floral-accents';

const INSTAGRAM_URL = 'https://www.instagram.com/allbeautyhairstudio';

export default async function GalleryPage() {
  const { posts, nextCursor } = await getInstagramPosts(12);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="relative py-16 sm:py-20">
        <Image
          src="https://images.unsplash.com/photo-1678356163587-6bb3afb89679?w=1920&q=80"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-white/85" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl text-warm-800 mb-4">
            My Work
          </h1>
          <p className="text-warm-500 leading-relaxed max-w-xl mx-auto">
            Real cuts, real color, real people who trusted me with their hair.
            Follow along on Instagram for the latest.
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-forest-500 text-white rounded-lg hover:bg-forest-600 transition-colors font-medium min-h-[48px]"
          >
            <Instagram size={20} />
            @allbeautyhairstudio
          </a>
        </div>
      </section>

      <FloralDivider className="py-4 text-forest-500" />

      {/* Instagram Feed */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {posts.length > 0 ? (
            <>
              <div className="text-center mb-10">
                <FloralBloom className="w-6 h-6 text-forest-500 mx-auto mb-3" />
                <h2 className="font-serif text-2xl text-warm-700">
                  Latest from Instagram
                </h2>
              </div>

              <InstagramFeed initialPosts={posts} initialCursor={nextCursor} />

              {/* Always-visible Instagram CTA */}
              <div className="text-center mt-10">
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-copper-500 hover:text-copper-600 font-medium transition-colors"
                >
                  <Instagram size={16} />
                  Follow @allbeautyhairstudio
                </a>
              </div>
            </>
          ) : (
            /* Fallback — no API token or API is down */
            <div className="text-center py-12">
              <FloralBloom className="w-8 h-8 text-forest-500 mx-auto mb-4" />
              <h2 className="font-serif text-2xl text-warm-700 mb-4">
                See My Latest Work
              </h2>
              <p className="text-warm-500 leading-relaxed max-w-md mx-auto mb-6">
                Head over to my Instagram for the latest cuts, color, and
                transformations. Every photo is a real client who trusted
                me with their hair.
              </p>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-forest-500 text-white rounded-lg hover:bg-forest-600 transition-colors font-medium min-h-[48px]"
              >
                <Instagram size={20} />
                Visit @allbeautyhairstudio
              </a>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
