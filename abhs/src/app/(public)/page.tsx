import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar } from 'lucide-react';
import { FloralCorner } from '@/components/decorative/floral-accents';
import { MotionReveal, MotionRevealChild, MotionParallax, MotionPage, MotionFloral, MotionButton } from '@/components/motion';
import { FloralDividerAnimated } from '@/components/decorative/floral-divider-animated';

export default function HomePage() {
  return (
    <MotionPage>
      <div className="flex flex-col">
        {/* Hero --Karli front and center */}
        <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center overflow-hidden">
          {/* Background image with parallax */}
          <MotionParallax speed={0.3} className="absolute inset-0">
            <Image
              src="/salon.webp"
              alt=""
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </MotionParallax>
          {/* Overlay --slightly less white so the salon comes through more */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/72 to-white/40" />

          {/* Subtle floral corner accent */}
          <MotionFloral>
            <FloralCorner withVines className="absolute bottom-6 right-6 w-56 h-56 sm:w-72 sm:h-72 text-forest-500 opacity-30" />
          </MotionFloral>

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20">
            <MotionReveal stagger={0.15}>
              <div className="max-w-2xl">
                {/* Personal greeting --bold, warm, in your face */}
                <MotionRevealChild>
                  <p className="text-copper-500 font-medium text-lg sm:text-xl mb-3 tracking-wide">
                    Hi, I&apos;m Karli.
                  </p>
                </MotionRevealChild>
                <MotionRevealChild>
                  <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-warm-800 leading-[1.1] mb-6">
                    I design hair that<br />
                    <span className="text-copper-500">works with your life</span>
                  </h1>
                </MotionRevealChild>
                <MotionRevealChild>
                  <p className="text-lg sm:text-xl text-warm-600 mb-10 leading-relaxed max-w-lg">
                    I know what it means to build a life around real limitations --
                    and I bring that understanding to every cut and every color.
                    Your hair should give you one less thing to worry about.
                  </p>
                </MotionRevealChild>
                <MotionRevealChild>
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <MotionButton>
                      <Link
                        href="/newclientform"
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-forest-500 text-white rounded-lg hover:bg-forest-600 transition-colors font-medium min-h-[48px] shadow-md text-base"
                      >
                        <Calendar size={18} />
                        New Here? Let&apos;s Talk
                      </Link>
                    </MotionButton>
                    <MotionButton>
                      <Link
                        href="/book"
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/80 backdrop-blur-sm border border-warm-300 text-warm-600 rounded-lg hover:bg-white transition-colors font-medium min-h-[48px] text-base"
                      >
                        Already a Client? Book Here
                        <ArrowRight size={16} />
                      </Link>
                    </MotionButton>
                  </div>
                </MotionRevealChild>
              </div>
            </MotionReveal>
          </div>
        </section>

        {/* Floral transition */}
        <FloralDividerAnimated className="py-6 text-forest-500" />

        {/* The Person Behind the Chair + What Makes This Different */}
        <section className="relative py-16 sm:py-20 overflow-hidden">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
              <MotionReveal direction="left">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src="/karli.jpg"
                    alt="Karli Rosario, intentional hair designer"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute bottom-0 right-0">
                    <MotionFloral>
                      <FloralCorner className="w-32 h-32 text-white opacity-30" />
                    </MotionFloral>
                  </div>
                </div>
              </MotionReveal>
              <MotionReveal direction="right" delay={0.2}>
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-warm-700 mb-5">
                    The Person Behind the Chair
                  </h2>
                  <blockquote className="text-warm-500 leading-relaxed italic pl-8 border-l-2 border-copper-400 mb-6">
                    &#8220;Doing hair has changed my life in more ways than I could
                    ever put into words. And every day, when people sit in my chair,
                    I try to give them even a piece of what that means to me.&#8221;
                  </blockquote>
                  <p className="text-warm-500 leading-relaxed mb-6">
                    I came back to this work after years of loss and rebuilding.
                    Hair became the way I chose myself again --and now it&apos;s
                    how I help other people feel like themselves, too.
                  </p>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-1.5 text-copper-500 font-medium hover:text-copper-600 transition-colors"
                  >
                    My Journey --Read More
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </MotionReveal>
            </div>

            {/* What Makes This Different */}
            <div className="mt-14 pt-14 border-t border-warm-200">
              <h3 className="font-serif text-2xl sm:text-3xl text-warm-700 text-center mb-10">
                What Makes My Process Different
              </h3>
              <MotionReveal stagger={0.15}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                  <MotionRevealChild>
                    <div>
                      <h4 className="font-serif text-lg text-warm-700 mb-2">
                        It starts with your life, not a reference photo.
                      </h4>
                      <p className="text-warm-500 leading-relaxed text-sm">
                        Before I pick up scissors, I want to know how you spend your
                        mornings, how much time you actually want to spend on your hair,
                        and what makes you feel like yourself. The hair comes from that
                        conversation --not the other way around.
                      </p>
                    </div>
                  </MotionRevealChild>
                  <MotionRevealChild>
                    <div>
                      <h4 className="font-serif text-lg text-warm-700 mb-2">
                        I&apos;ll tell you the truth.
                      </h4>
                      <p className="text-warm-500 leading-relaxed text-sm">
                        If something won&apos;t work with your hair texture, your
                        lifestyle, or your maintenance level --I&apos;ll say so.
                        Not to talk you out of anything, but because you deserve
                        a stylist who&apos;s honest with you, not just agreeable.
                      </p>
                    </div>
                  </MotionRevealChild>
                  <MotionRevealChild>
                    <div>
                      <h4 className="font-serif text-lg text-warm-700 mb-2">
                        You decide when you come back.
                      </h4>
                      <p className="text-warm-500 leading-relaxed text-sm">
                        I design cuts and color that grow out gracefully. You
                        won&apos;t leave here locked into a six-week cycle. Clients
                        come back months later and their hair still looks intentional.
                        That&apos;s the whole point.
                      </p>
                    </div>
                  </MotionRevealChild>
                </div>
              </MotionReveal>
            </div>
          </div>
        </section>

        {/* Final CTA with background */}
        <section className="relative py-20 sm:py-28">
          <Image
            src="/bowls.webp"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-white/60" />
          <MotionReveal>
            <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="font-serif text-2xl sm:text-3xl text-warm-700 mb-4">
                There&apos;s a chair here whenever you&apos;re ready.
              </h2>
              <p className="text-warm-500 mb-8 leading-relaxed">
                No pressure, no hard sell. Just an honest conversation about your
                hair and what would actually work for your life.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <MotionButton>
                  <Link
                    href="/newclientform"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-forest-500 text-white rounded-lg hover:bg-forest-600 transition-colors font-medium min-h-[48px] shadow-md text-base"
                  >
                    <Calendar size={18} />
                    New Here? Let&apos;s Talk
                  </Link>
                </MotionButton>
                <MotionButton>
                  <Link
                    href="/book"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/80 backdrop-blur-sm border border-warm-300 text-warm-600 rounded-lg hover:bg-white transition-colors font-medium min-h-[48px] text-base"
                  >
                    Already a Client? Book Here
                    <ArrowRight size={16} />
                  </Link>
                </MotionButton>
              </div>
            </div>
          </MotionReveal>
        </section>
      </div>
    </MotionPage>
  );
}
