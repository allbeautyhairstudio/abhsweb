import Link from 'next/link';

const legalNav = [
  { href: '/legal/privacy', label: 'Privacy Policy' },
  { href: '/legal/terms', label: 'Terms of Use' },
  { href: '/legal/ai-disclosure', label: 'AI Disclosure' },
  { href: '/legal/retention', label: 'Data Retention' },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="relative py-12 sm:py-16 bg-warm-50">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl text-warm-800 mb-4">
            Policies & Transparency
          </h1>
          <p className="text-warm-500 leading-relaxed max-w-2xl mx-auto">
            Your trust matters. Here&apos;s how we handle your information, what to expect when you work with us, and how technology fits into what we do.
          </p>
        </div>
      </section>

      {/* Nav + Content */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Horizontal nav for all screens */}
          <nav className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-warm-100" aria-label="Legal pages">
            {legalNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 text-sm rounded-md text-warm-500 hover:text-warm-700 hover:bg-warm-50 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {children}
        </div>
      </section>
    </div>
  );
}
