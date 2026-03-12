import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Thoughts on intentional hair design, hair care tips, and building confidence through honest, grounded styling.',
};

// Blog posts — will be migrated from existing site and converted to MDX
// For now, using static data. Each will become its own /blog/[slug] page.
const blogPosts = [
  {
    slug: 'more-than-just-hair',
    title: 'More Than Just Hair: Non-Binary Haircuts & Inclusion',
    excerpt:
      'Hair is deeply personal. For many non-binary and gender-nonconforming people, finding a stylist who truly sees them can be life-changing.',
    date: '2023-07-03',
    category: 'Inclusive Hair',
    author: 'Bas Rosario',
    coverImage: 'https://images.unsplash.com/photo-1625038032200-648fbcd800d0?w=600&q=80',
    coverAlt: 'Professional hair scissors and styling comb',
  },
  {
    slug: 'summer-hair-care',
    title: 'Slay the Summer Sizzle: 5 Hair Care Essentials',
    excerpt:
      'Summer sun, chlorine, and salt water don\'t have to wreck your hair. Here are five things that actually work.',
    date: '2023-06-25',
    category: 'Hair Care',
    author: 'Karli Rosario',
    coverImage: 'https://images.unsplash.com/photo-1634082983637-c1382c567945?w=600&q=80',
    coverAlt: 'Natural wooden combs arranged on a white surface',
  },
  {
    slug: 'hair-myths-debunked',
    title: 'Hair We Go: Splitting Hairs Over 10 Mane Myths',
    excerpt:
      'From "cutting your hair makes it grow faster" to "you should wash your hair every day" — let\'s separate fact from fiction.',
    date: '2023-06-17',
    category: 'Hair Care',
    author: 'Karli Rosario',
    coverImage: 'https://images.unsplash.com/photo-1567034899073-2232ce224d02?w=600&q=80',
    coverAlt: 'Two professional hairdressing scissors',
  },
  {
    slug: 'high-vs-low-maintenance',
    title: 'High Maintenance vs. Low Maintenance Hair: Choose Your Destiny',
    excerpt:
      'Understanding the real cost of your hair choices — in time, money, and energy. There\'s no wrong answer, just an informed one.',
    date: '2023-05-14',
    category: 'Intentional Hair',
    author: 'Bas Rosario',
    coverImage: 'https://images.unsplash.com/photo-1596362601603-b74f6ef166e4?w=600&q=80',
    coverAlt: 'Stainless steel scissors and hair comb',
  },
  {
    slug: 'haircut-trends-2023',
    title: 'Haircut Trends 2023: The 7 Hottest Styles',
    excerpt:
      'A look at what was trending — and a reminder that trends are inspiration, not instructions.',
    date: '2023-04-23',
    category: 'Style',
    author: 'Karli Rosario',
    coverImage: 'https://images.unsplash.com/photo-1656921350183-7935040cf7fb?w=600&q=80',
    coverAlt: 'A collection of professional scissors and combs',
  },
  {
    slug: 'low-maintenance-hair-secret',
    title: 'Discover the Secret to Low Maintenance, Show-Stopping Hair',
    excerpt:
      'The secret isn\'t a product or a technique. It\'s designing your hair around your life, not the other way around.',
    date: '2023-04-06',
    category: 'Intentional Hair',
    author: 'Karli Rosario',
    coverImage: 'https://images.unsplash.com/photo-1678356163587-6bb3afb89679?w=600&q=80',
    coverAlt: 'Hair brush and scissors on a styling table',
  },
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogPage() {
  return (
    <div className="flex flex-col">
      {/* Header with background image */}
      <section className="relative py-16 sm:py-20">
        <Image
          src="https://images.unsplash.com/photo-1634082983637-c1382c567945?w=1920&q=80"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-white/85" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl text-warm-800 mb-4">
            Blog
          </h1>
          <p className="text-warm-500 leading-relaxed">
            Thoughts on intentional hair, honest advice, and the things I wish
            more people talked about.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {blogPosts.map((post) => (
              <article
                key={post.slug}
                className="bg-white rounded-lg border border-warm-100 overflow-hidden hover:border-warm-200 transition-colors group"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={post.coverImage}
                    alt={post.coverAlt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-sage-100 text-sage-500 px-2 py-0.5 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-xs text-warm-400">
                      {formatDate(post.date)}
                    </span>
                  </div>
                  <h2 className="font-serif text-lg text-warm-700 mb-2 leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-sm text-warm-500 leading-relaxed mb-3">
                    {post.excerpt}
                  </p>
                  <p className="text-xs text-warm-400 mb-3">
                    By {post.author}
                  </p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-sm text-copper-500 hover:text-copper-600 font-medium inline-flex items-center gap-1 transition-colors"
                  >
                    Read more <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
