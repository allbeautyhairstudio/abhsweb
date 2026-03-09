import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar } from 'lucide-react';
import { FloralBloom, FloralDivider, FloralCorner } from '@/components/decorative/floral-accents';

export const metadata: Metadata = {
  title: 'Intentional Hair Philosophy',
  description:
    'What intentional hair design means — hair that grows out beautifully, works with your real routines, and lets you decide when to come back.',
};

export default function PhilosophyPage() {
  return (
    <div className="flex flex-col">
      {/* Title section */}
      <section className="py-14 sm:py-16 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <FloralBloom className="w-7 h-7 text-forest-500 mx-auto mb-3" />
          <h1 className="font-serif text-3xl sm:text-4xl text-warm-800 mb-4">
            Intentional Hair Design
          </h1>
          <p className="text-warm-500 leading-relaxed max-w-2xl mx-auto">
            Hair should not add stress to your life. It should support how you
            live.
          </p>
        </div>
      </section>

      {/* Banner image */}
      <section className="relative py-40 sm:py-56">
        <Image
          src="/scizzors.webp"
          alt=""
          fill
          className="object-cover object-[center_55%]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-white/85" />
      </section>

      {/* What It Is */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <FloralBloom className="w-5 h-5 text-forest-500 mb-3" />
          <h2 className="font-serif text-2xl text-warm-700 mb-5">
            What Is Intentional Hair?
          </h2>
          <div className="space-y-4 text-warm-500 leading-relaxed">
            <p>
              Intentional hair design means every decision — every cut, every
              color placement, every product recommendation — is made with your
              real life in mind.
            </p>
            <p>
              It&apos;s not about chasing the latest trend or recreating a
              Pinterest photo. It&apos;s about designing hair that:
            </p>
            <ul className="space-y-3 pl-4">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-sage-400 rounded-full shrink-0 mt-2" />
                <span>Grows out beautifully — so you decide when to come back</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-sage-400 rounded-full shrink-0 mt-2" />
                <span>Works with your natural texture and daily routine</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-sage-400 rounded-full shrink-0 mt-2" />
                <span>Feels current without chasing noise</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-sage-400 rounded-full shrink-0 mt-2" />
                <span>Respects your time, energy, and budget</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Floral divider */}
      <FloralDivider className="text-forest-500 px-4" />

      {/* Why It Matters */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <FloralBloom className="w-5 h-5 text-forest-500 mb-3" />
          <h2 className="font-serif text-2xl text-warm-700 mb-5">
            Why It Matters
          </h2>
          <div className="space-y-4 text-warm-500 leading-relaxed">
            <p>
              Most people have experienced the frustration of hair that looks
              amazing on day one and feels like a problem by week three. Roots
              showing, grow-out lines appearing, a cut that doesn&apos;t hold
              its shape.
            </p>
            <p>
              That&apos;s not your fault — it&apos;s a design problem. When
              hair is designed with longevity in mind, it still looks and feels
              good at week six, week eight, even week twelve.
            </p>
            <p>
              Intentional hair means you&apos;re not locked into a maintenance
              cycle that doesn&apos;t fit your life. You get relief from
              maintenance stress, confidence that lasts, and the freedom to come
              back when you&apos;re ready — not when your hair demands it.
            </p>
          </div>
        </div>
      </section>

      {/* Floral divider */}
      <FloralDivider className="text-forest-500 px-4" />

      {/* How It Works */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <FloralBloom className="w-5 h-5 text-forest-500 mb-3" />
          <h2 className="font-serif text-2xl text-warm-700 mb-5">
            How It Works in Practice
          </h2>
          <div className="space-y-4 text-warm-500 leading-relaxed">
            <p>
              When you sit in my chair, we don&apos;t start with a reference
              photo. We start with your life.
            </p>
            <p>
              How much time do you spend on your hair each morning? Do you
              air-dry or blow-dry? How often do you realistically want to come
              back? What frustrates you most about your hair right now?
            </p>
            <p>
              From there, every decision is made with intention:
            </p>
            <ul className="space-y-3 pl-4">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-copper-400 rounded-full shrink-0 mt-2" />
                <span>
                  <strong className="text-warm-600">Cuts</strong> are shaped to
                  fall naturally, air-dry well, and maintain their structure as
                  they grow
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-copper-400 rounded-full shrink-0 mt-2" />
                <span>
                  <strong className="text-warm-600">Color placement</strong> is
                  strategic — highlights and balayage are positioned for
                  graceful grow-out, not harsh lines
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-copper-400 rounded-full shrink-0 mt-2" />
                <span>
                  <strong className="text-warm-600">Formulations</strong>{' '}
                  enhance your natural tones rather than fighting them
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-copper-400 rounded-full shrink-0 mt-2" />
                <span>
                  <strong className="text-warm-600">Maintenance plans</strong>{' '}
                  are realistic for your schedule, not designed to keep you
                  coming back every 4 weeks
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Pull Quote */}
      <section className="relative py-10 sm:py-12 bg-blush-50 overflow-hidden">
        <FloralCorner className="absolute top-0 left-0 w-20 h-20 text-forest-500 opacity-25 rotate-90" />
        <FloralCorner className="absolute bottom-0 right-0 w-20 h-20 text-forest-500 opacity-25 -rotate-90" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <FloralBloom className="w-6 h-6 text-forest-500/40 mx-auto mb-4" />
          <blockquote className="font-serif text-xl sm:text-2xl text-warm-700 italic leading-relaxed">
            &ldquo;You design intentional hair that reduces stress, grows out
            beautifully, and supports how real people live.&rdquo;
          </blockquote>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-2xl text-warm-700 mb-4">
            Ready to Try It?
          </h2>
          <p className="text-warm-500 text-sm leading-relaxed mb-8 max-w-xl mx-auto">
            A consultation is the best place to start. We&apos;ll talk about
            your hair, your life, and design a plan that works for both.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/newclientform"
              className="inline-flex items-center gap-2 px-6 py-3 bg-forest-500 text-white rounded-lg hover:bg-forest-600 transition-colors text-sm font-medium min-h-[44px]"
            >
              <Calendar size={16} />
              New Client? Start Here
            </Link>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-warm-300 text-warm-600 rounded-lg hover:bg-warm-50 transition-colors text-sm font-medium min-h-[44px]"
            >
              Returning Client Booking
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
