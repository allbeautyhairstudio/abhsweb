'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FloralBloom, FloralCorner } from '@/components/decorative/floral-accents';
import { FloralDividerAnimated } from '@/components/decorative/floral-divider-animated';
import { MotionPage, MotionReveal, MotionRevealChild, MotionFloral, MotionButton } from '@/components/motion';

const faqs = [
  {
    question: 'How do I book an appointment?',
    answer:
      'Start with my new client form — it helps me understand your hair before we even meet. I want to be prepared for you, not winging it. Once I get your info, I\'ll reach out within a couple business days and we\'ll get you on the books.',
  },
  {
    question: 'What should I expect at my first appointment?',
    answer:
      'I don\'t do cookie-cutter. Every first appointment starts with a real conversation — your hair history, your daily routine, how much time you actually want to spend on your hair, and what\'s been bugging you about it. No pressure, no upselling, no judgment. Just me being honest about what\'s going to work best for your life. We build a plan together from there.',
  },
  {
    question: 'Why don\'t you list prices on the website?',
    answer:
      'Because your hair isn\'t the same as anyone else\'s. Your texture, density, length, color history, and goals all change what the service looks like. I\'d rather have a real conversation about what you need and give you an honest number than post a price that doesn\'t actually apply to you. During your consultation, we\'ll talk through everything so there are no surprises — I promise.',
  },
  {
    question: 'How long do appointments typically take?',
    answer:
      'It really depends. A signature cut is usually around an hour. Custom color can be anywhere from 3 to 5+ hours depending on what we\'re doing — especially if there\'s a big correction or transformation involved. I\'ll always let you know upfront so you can plan your day. I don\'t like surprises any more than you do.',
  },
  {
    question: 'Where are you located?',
    answer:
      'I work out of my own suite at The Colour Parlor, a Sola salon in the Temecula area. It\'s just me and you — no chaos, no noise, no one else in your space. When you book, I\'ll send you the exact address and directions so you\'re not guessing.',
  },
  {
    question: 'What\'s your cancellation policy?',
    answer:
      'Life happens — I really do get it. I have chronic pain and a kid. I know plans change. All I ask is 24 hours notice if you need to cancel or reschedule. That time was set aside specifically for you, and late cancellations or no-shows may have a fee attached. Just communicate with me and we\'ll figure it out.',
  },
  {
    question: 'I don\'t know what I want — is that okay?',
    answer:
      'More than okay — honestly, some of my favorite appointments start this way. You don\'t need a Pinterest board or a plan. You don\'t even need the words for it yet. That\'s literally what I\'m here for. We\'ll talk about your life, your routine, what frustrates you, what makes you feel good — and I\'ll translate that into something that works. That\'s the whole point of intentional design.',
  },
  {
    question: 'How often will I need to come back?',
    answer:
      'This is actually the thing I\'m most passionate about. I design cuts and color that grow out gracefully — so you\'re not chained to a rigid schedule and panicking at six weeks. Some of my clients come every 6 weeks. Some come every 3-4 months and their hair still looks incredible. You decide when to come back, not your hair. That\'s what intentional hair design means.',
  },
];

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-warm-100">
      <button
        type="button"
        className="w-full flex items-center justify-between py-5 text-left min-h-[44px] group"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="font-medium text-warm-700 text-sm sm:text-base pr-4 group-hover:text-copper-500 transition-colors">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        >
          <ChevronDown size={18} className="text-copper-500" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.3, delay: isOpen ? 0.1 : 0 },
            }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-warm-500 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqPage() {
  return (
    <MotionPage>
      <div className="flex flex-col">
        {/* Header with background image */}
        <section className="relative py-16 sm:py-20">
          <Image
            src="https://images.unsplash.com/photo-1634225109865-7a7b6e4ef85c?w=1920&q=80"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-white/88" />
          <MotionFloral breathing cursorResponse>
            <FloralCorner className="absolute bottom-2 right-4 w-28 h-28 text-forest-500 opacity-25 scale-x-[-1]" />
          </MotionFloral>
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <MotionFloral>
              <FloralBloom className="w-10 h-10 text-forest-500 mx-auto mb-3" />
            </MotionFloral>
            <h1 className="font-serif text-3xl sm:text-4xl text-warm-800 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-warm-500 leading-relaxed">
              The stuff people usually want to know before they book. No fluff, just real answers.
            </p>
          </div>
        </section>

        {/* FAQ List */}
        <section className="py-14 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="divide-y divide-warm-100 border-t border-warm-100">
              <MotionReveal stagger={0.08}>
                {faqs.map((faq) => (
                  <MotionRevealChild key={faq.question}>
                    <FaqItem {...faq} />
                  </MotionRevealChild>
                ))}
              </MotionReveal>
            </div>
          </div>
        </section>

        <FloralDividerAnimated className="py-4 text-forest-500" />

        {/* Still have questions */}
        <section className="py-14 sm:py-16 bg-sage-50">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-serif text-2xl text-warm-700 mb-3">
              Still Have Questions?
            </h2>
            <p className="text-warm-500 text-sm mb-6">
              Seriously, ask me anything. There&apos;s no such thing as a dumb question when it comes to your hair.
            </p>
            <MotionButton>
              <a
                href="/newclientform"
                className="inline-flex items-center gap-2 px-6 py-3 bg-forest-500 text-white rounded-lg hover:bg-forest-600 transition-colors text-sm font-medium min-h-[44px]"
              >
                Reach Out — New Client Form
              </a>
            </MotionButton>
          </div>
        </section>
      </div>
    </MotionPage>
  );
}
