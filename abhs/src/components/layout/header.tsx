'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Scissors } from 'lucide-react';
import { MobileNav } from './mobile-nav';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/philosophy', label: 'Philosophy' },
  { href: '/faq', label: 'FAQ' },
  { href: '/book', label: 'Book', cta: true },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-warm-200">
      <nav
        className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand */}
          <Link
            href="/"
            className="font-serif text-xl tracking-wide text-warm-700 hover:text-copper-500 transition-colors"
          >
            <Scissors size={18} className="inline-block mr-1.5 -mt-0.5" aria-hidden="true" />
            Karli Rosario
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                {'cta' in link && link.cta ? (
                  <Link
                    href={link.href}
                    className="px-4 py-2 bg-forest-500 text-white rounded-lg hover:bg-forest-600 transition-colors text-sm font-medium"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <Link
                    href={link.href}
                    className="text-sm text-warm-500 hover:text-copper-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 text-warm-600 hover:text-copper-500 min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile nav drawer */}
      <MobileNav
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={navLinks}
      />
    </header>
  );
}
