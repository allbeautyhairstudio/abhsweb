import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import { FloralCorner } from '@/components/decorative/floral-accents';
import { FloralDividerAnimated } from '@/components/decorative/floral-divider-animated';
import { MotionPage, MotionReveal, MotionRevealChild, MotionFloral, MotionButton } from '@/components/motion';

export const metadata: Metadata = {
  title: 'My Journey',
  description:
    'How Karli Rosario found her way back to the arts through hair, a story about loss, resilience, and choosing yourself.',
};

export default function AboutPage() {
  return (
    <MotionPage>
      <div className="flex flex-col">
        {/* Title section */}
        <section className="py-14 sm:py-16 bg-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">            <MotionReveal delay={0.1}>
              <h1 className="font-serif text-3xl sm:text-4xl text-warm-800 mb-4">
                My Journey
              </h1>
              <p className="text-warm-500 leading-relaxed">
                How I got here, and why every person who sits in my chair matters.
              </p>
            </MotionReveal>
          </div>
        </section>

        {/* Banner image with logo */}
        <MotionReveal direction="none" delay={0.2}>
          <section className="relative h-80 sm:h-[28rem]">
            <Image
              src="/journey/banner-01.webp"
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-white/65 via-white/40 to-white/15" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-56 h-56 sm:w-[19rem] sm:h-[19rem]">
                <Image
                  src="/Logo.png"
                  alt="All Beauty Hair Studio"
                  fill
                  className="object-contain drop-shadow-lg"
                  sizes="224px"
                />
              </div>
            </div>
          </section>
        </MotionReveal>

        {/* Chapter 1 */}
        <MotionReveal>
          <section className="pt-14 sm:pt-20 pb-14 sm:pb-16">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <h2 className="font-serif text-2xl text-warm-700 mb-5">
                The Arts Were Where My Passions Lived
              </h2>
              <div className="space-y-4 text-warm-500 leading-relaxed">
                <p>
                  Growing up, I was a singer and a dancer from a really young age.
                  Every year we&apos;d have recitals, concerts, performances, or
                  competitions, all of which required hair and makeup.
                </p>
                <p>
                  At a pretty young age, I caught on to how to do my own hair and
                  makeup, and by the time I was a teen, I was helping others with
                  theirs for performances. That led to doing hair and makeup for
                  friends and family for their special events.
                </p>
                <p>
                  But back then, my biggest passion was actually makeup. I loved the
                  creativity it gave me. I loved being able to turn someone into a
                  different creature or person. My youngest sister was my muse. She
                  would let me do anything to her. I could go to her room at 2 a.m.
                  and say, &ldquo;I have an idea, I want to turn you into a fairy,
                  place you in the trees, and take pictures of you for my
                  portfolio.&rdquo;
                </p>
              </div>
            </div>
          </section>
        </MotionReveal>

        {/* Floral divider */}
        <FloralDividerAnimated className="text-forest-500 px-4" />

        {/* Chapter 2 */}
        <MotionReveal>
          <section className="py-14 sm:py-16">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <h2 className="font-serif text-2xl text-warm-700 mb-5">
                When My Muse Left
              </h2>
              <div className="space-y-4 text-warm-500 leading-relaxed">
                <p>
                  At twenty-seven, the worst thing in my life happened. I lost my
                  youngest sister, my muse, to a car accident. She was only
                  eighteen and had just graduated high school four months prior.
                </p>
                <p>
                  When my muse died, so did my passion for all the arts. I had no
                  desire to sing or dance or do makeup or hair. Life felt pretty
                  dark for a few years.
                </p>
              </div>
            </div>
          </section>
        </MotionReveal>

        {/* Floral divider */}
        <FloralDividerAnimated className="text-forest-500 px-4" />

        {/* Chapter 3 */}
        <MotionReveal>
          <section className="py-14 sm:py-16">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <h2 className="font-serif text-2xl text-warm-700 mb-5">
                Finding My Way Back
              </h2>
              <div className="space-y-4 text-warm-500 leading-relaxed">
                <p>
                  During that time, I met my husband online. Just as he&apos;s
                  gotten me interested in AI recently, back then he introduced me to
                  Photoshop. And I started to see a spark of creativity come back.
                </p>
                <p>
                  I focused on getting my Associate&apos;s degree in Arts and Visual
                  Communications. I learned everything I could about graphic design.
                  It fed me in the same way hair and makeup did, it was something
                  that allowed me to be fully creative.
                </p>
                <p>
                  But my body was failing me in ways I still knew nothing about.
                  Before I was ever diagnosed with hEDS/vEDS, I just thought
                  something was wrong with me. Pregnancy was incredibly hard on my
                  undiagnosed body. And after having my daughter, I struggled with
                  really bad postpartum depression.
                </p>
                <p>
                  I was having terrible flare-ups and nonstop, scary anxiety attacks.
                  I became agoraphobic and barely left my house for over a year.
                </p>
              </div>
            </div>
          </section>
        </MotionReveal>

        {/* Floral divider */}
        <FloralDividerAnimated className="text-forest-500 px-4" />

        {/* Chapter 4 */}
        <MotionReveal>
          <section className="py-14 sm:py-16">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <h2 className="font-serif text-2xl text-warm-700 mb-5">
                Choosing Myself
              </h2>
              <div className="space-y-4 text-warm-500 leading-relaxed">
                <p>
                  In finding myself and my purpose again, I was reminded of how
                  happy and peaceful the arts had always been for me. I thought back
                  to those times when I felt truly like myself.
                </p>
                <p>
                  I was reminded of the happiness my gifts had brought others, how
                  the simplest makeup, when done right, could make someone smile
                  from ear to ear. The way someone looked at themselves when they
                  saw their hair for the first time after a big color change.
                </p>

                {/* Pull quote */}
                <blockquote className="relative my-8 py-6 px-6 border-l-2 border-copper-400 bg-blush-50 rounded-r-lg">
                  <MotionFloral>
                    <FloralCorner className="absolute -top-2 -right-2 w-24 h-24 text-forest-500 opacity-25 scale-x-[-1]" />
                  </MotionFloral>
                  <p className="font-serif text-lg text-warm-700 italic leading-relaxed">
                    &ldquo;I knew I had to go back to school. This time, I was doing
                    it for me, not for someone else, but for me.&rdquo;
                  </p>
                </blockquote>

                <p>
                  I could barely leave my house and had no idea how I was going to
                  manage going to school full-time. I decided to take the long
                  route. It was going to take me two years to get my license
                  part-time, but I took it minute by minute, hour by hour, day by
                  day, until I pulled myself out of a very dark hole.
                </p>
              </div>
            </div>
          </section>
        </MotionReveal>

        {/* Journey photos -- growth */}
        <MotionReveal stagger={0.15} className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-10">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MotionRevealChild>
              <div className="relative aspect-square rounded-xl overflow-hidden shadow-md">
                <Image
                  src="/journey/journey-03.webp"
                  alt="Karli teaching and demonstrating hair techniques"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            </MotionRevealChild>
            <MotionRevealChild>
              <div className="relative aspect-square rounded-xl overflow-hidden shadow-md">
                <Image
                  src="/journey/journey-12.webp"
                  alt="Karli applying color technique on a mannequin head"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            </MotionRevealChild>
            <MotionRevealChild>
              <div className="relative aspect-square rounded-xl overflow-hidden shadow-md col-span-2 md:col-span-1">
                <Image
                  src="/journey/journey-04.webp"
                  alt="Color bowl and foils -- the tools of the craft"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            </MotionRevealChild>
          </div>
        </MotionReveal>

        {/* Floral divider */}
        <FloralDividerAnimated className="text-forest-500 px-4" />

        {/* Chapter 5 */}
        <MotionReveal>
          <section className="py-14 sm:py-16">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <h2 className="font-serif text-2xl text-warm-700 mb-5">
                What It Means When You Sit in My Chair
              </h2>
              <div className="space-y-4 text-warm-500 leading-relaxed">
                <p>
                  As much as I love being the person who helps change people&apos;s
                  lives, I can never be more grateful than the day I chose myself.
                  Doing hair has changed my life in more ways than I could ever put
                  into words.
                </p>
                <p>
                  And every day, when people sit in my chair, I try to give them
                  even a piece of what that means to me.
                </p>
                <p>
                  What I love most isn&apos;t &ldquo;nailing it.&rdquo; It&apos;s
                  the connection. It&apos;s when a client says, &ldquo;I came in
                  here not even really knowing exactly what I wanted, or how to even
                  explain it to you, but somehow, you nailed it.&rdquo; That means
                  we connected on a level that allowed communication to break
                  through barriers.
                </p>
              </div>
            </div>
          </section>
        </MotionReveal>

        {/* Floral divider */}
        <FloralDividerAnimated className="text-forest-500 px-4" />

        {/* Chapter 6 */}
        <MotionReveal>
          <section className="py-14 sm:py-16">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <h2 className="font-serif text-2xl text-warm-700 mb-5">
                What I Wish Every Client Knew
              </h2>
              <div className="space-y-4 text-warm-500 leading-relaxed">
                <p>
                  I wish people knew how much I&apos;m in their corner.
                </p>
                <p>
                  I&apos;m neurodivergent, and I don&apos;t let that hold me back.
                  In fact, it&apos;s my superpower. I feel like it allows me to see
                  patterns that others might not.
                </p>
                <p>
                  I want people to know that I&apos;m an honest hairstylist. I
                  don&apos;t have a problem having the hard conversations. I love
                  educating my clients and helping them make the best choices for
                  them and their lifestyle.
                </p>

                {/* Pull quote */}
                <blockquote className="relative my-8 py-6 px-6 border-l-2 border-sage-400 bg-sage-50 rounded-r-lg">
                  <MotionFloral>
                    <FloralCorner className="absolute -top-2 -right-2 w-24 h-24 text-forest-500 opacity-25 scale-x-[-1]" />
                  </MotionFloral>
                  <p className="font-serif text-lg text-warm-700 italic leading-relaxed">
                    &ldquo;Whether it&apos;s clients or other stylists, when
                    I&apos;m working with them, I just want them to know that
                    I&apos;m honest, trustworthy, intentional, and
                    purposeful.&rdquo;
                  </p>
                </blockquote>

                <p>
                  I also absolutely love when clients come back and their hair still
                  looks amazing. They laugh and say, &ldquo;I know! I actually just
                  got a compliment today and I didn&apos;t have the nerve to tell
                  them I haven&apos;t had it done in six months.&rdquo;
                </p>
                <p>That&apos;s priceless to me.</p>
              </div>
            </div>
          </section>
        </MotionReveal>

        {/* Closing floral */}
        <FloralDividerAnimated className="text-forest-500 pb-8 px-4" />

        {/* CTA */}
        <MotionReveal>
          <section className="py-16 sm:py-20">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="font-serif text-2xl sm:text-3xl text-warm-700 mb-4">
                Ready to start your own story?
              </h2>
              <p className="text-warm-500 mb-8 leading-relaxed">
                Every great transformation begins with a conversation.
                Tell me about you, your hair, and what you&apos;re looking for.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <MotionButton>
                  <Link
                    href="/newclientform"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-forest-500 text-white rounded-lg hover:bg-forest-600 transition-colors font-medium min-h-[48px] shadow-md text-base"
                  >
                    <Calendar size={18} />
                    Let&apos;s Talk About Your Hair
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
          </section>
        </MotionReveal>
      </div>
    </MotionPage>
  );
}
