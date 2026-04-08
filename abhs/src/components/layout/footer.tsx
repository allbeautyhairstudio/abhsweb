import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Clock, Instagram, Calendar, ArrowRight } from 'lucide-react';
import { FloralDivider, FloralBloom } from '@/components/decorative/floral-accents';

export function Footer() {
  return (
    <footer className="bg-warm-700 text-warm-200 mt-auto">
      {/* Floral divider at top */}
      <div className="pt-8 pb-2">
        <FloralDivider className="text-warm-500 opacity-40" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FloralBloom className="w-5 h-5 text-copper-400" />
              <p className="font-serif text-xl text-white">Karli Rosario</p>
            </div>
            <p className="text-warm-300 text-sm leading-relaxed">
              Hair designed around your life, not the other way around.
            </p>
          </div>

          {/* Location & Hours */}
          <div className="space-y-3">
            <p className="text-white font-medium text-sm mb-3">Location</p>
            <a
              href="https://maps.google.com/?q=32395+Clinton+Keith+Rd+Suite+A-103+Wildomar+CA+92595"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 group"
            >
              <MapPin size={16} className="mt-1 shrink-0 text-sage-300" />
              <div className="text-sm">
                <p className="text-white font-medium group-hover:text-copper-300 transition-colors">The Colour Parlor</p>
                <p className="text-warm-300 group-hover:text-copper-300 transition-colors">Wildomar, CA</p>
              </div>
            </a>
            <div className="flex items-start gap-2">
              <Clock size={16} className="mt-1 shrink-0 text-sage-300" />
              <div className="text-sm text-warm-300">
                <p>By appointment only</p>
              </div>
            </div>
            <a
              href="tel:+19515416620"
              className="flex items-center gap-2 group mt-1"
            >
              <span className="text-sm text-warm-300 group-hover:text-copper-300 transition-colors">
                (951) 541-6620
              </span>
            </a>
          </div>

          {/* Book Now */}
          <div>
            <p className="text-white font-medium text-sm mb-3">Book Now</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/newclientform"
                  className="text-warm-300 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <Calendar size={13} />
                  New Client Form
                </Link>
              </li>
              <li>
                <Link
                  href="/book"
                  className="text-warm-300 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <Calendar size={13} />
                  Returning Client Booking
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-white font-medium text-sm mb-3">Quick Links</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/gallery" className="text-warm-300 hover:text-white transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-warm-300 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/book" className="text-warm-300 hover:text-white transition-colors">
                  Book Now
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-warm-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-warm-300 hover:text-white transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/legal/ai-disclosure" className="text-warm-300 hover:text-white transition-colors">
                  AI Disclosure
                </Link>
              </li>
              <li>
                <Link href="/legal/retention" className="text-warm-300 hover:text-white transition-colors">
                  Data Retention
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-warm-600 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-warm-400">
            &copy; {new Date().getFullYear()} Karli Rosario / All Beauty Hair Studio. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-10">
              <Image
                src="/lgbtqia-friendly.webp"
                alt="LGBTQIA+ friendly — everyone is welcome here"
                fill
                className="object-contain"
                sizes="64px"
              />
            </div>
            <a
              href="https://www.instagram.com/allbeautyhairstudio"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Karli on Instagram"
              className="text-warm-400 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
