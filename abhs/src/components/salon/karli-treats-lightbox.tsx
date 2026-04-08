'use client';

import { useState } from 'react';
import { X, Coffee, Droplets, Apple, Candy, Calendar, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function generateBirthdayIcs(): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//All Beauty Hair Studio//EN',
    'BEGIN:VEVENT',
    'DTSTART;VALUE=DATE:20261121',
    'DTEND;VALUE=DATE:20261122',
    'RRULE:FREQ=YEARLY',
    'SUMMARY:Karli\'s Birthday!',
    'DESCRIPTION:Don\'t forget to wish your favorite stylist a happy birthday!',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

function handleDownloadIcs() {
  const ics = generateBirthdayIcs();
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'karlis-birthday.ics';
  a.click();
  URL.revokeObjectURL(url);
}

interface TreatItem {
  name: string;
  detail: string | null;
}

interface Category {
  icon: typeof Coffee;
  title: string;
  color: string;
  items: TreatItem[];
}

const leftColumn: Category[] = [
  {
    icon: Coffee,
    title: 'Starbucks Order',
    color: 'bg-copper-400/10 text-copper-500',
    items: [
      { name: 'Passion Tea Lemonade (Iced)', detail: 'Sweetened' },
    ],
  },
  {
    icon: Apple,
    title: 'Snacks',
    color: 'bg-forest-100 text-forest-500',
    items: [
      { name: 'Meat sticks or beef jerky', detail: 'Original flavor only' },
      { name: 'Packaged watermelon', detail: null },
      { name: 'Apples', detail: null },
      { name: 'Cucumbers', detail: null },
    ],
  },
];

const rightColumn: Category[] = [
  {
    icon: Droplets,
    title: 'Drinks',
    color: 'bg-sky-100 text-sky-600',
    items: [
      { name: 'Waterloo Sparkling Water', detail: 'Current fav: Lemon Italian Ice' },
      { name: 'Any water', detail: 'Large bottle is perfect' },
    ],
  },
  {
    icon: Candy,
    title: 'Sweets',
    color: 'bg-pink-50 text-pink-500',
    items: [
      { name: 'Gluten-free gummy candy', detail: 'Worms, bears, fruit slices' },
      { name: 'Orange slices', detail: 'Her absolute favorite!' },
    ],
  },
];

function CategoryCard({ cat }: { cat: Category }) {
  const Icon = cat.icon;
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2.5">
        <span className={`p-1.5 rounded-lg ${cat.color}`}>
          <Icon size={16} />
        </span>
        <h3 className="font-semibold text-warm-700 text-xs tracking-wide uppercase">
          {cat.title}
        </h3>
      </div>
      <div className="space-y-1.5">
        {cat.items.map((item) => (
          <div
            key={item.name}
            className="bg-white/70 rounded-lg px-3 py-2 border border-warm-100/80"
          >
            <p className="text-warm-700 font-medium text-sm leading-snug">{item.name}</p>
            {item.detail && (
              <p className="text-warm-400 text-xs mt-0.5">{item.detail}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function KarliTreatsLightbox() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 text-copper-500 font-medium hover:text-copper-600 transition-colors underline underline-offset-2"
      >
        See Karli&apos;s Safe Treats List
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-gradient-to-br from-warm-50 via-white to-blush-50 rounded-2xl w-[92%] sm:w-[80%] max-w-[700px] max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-2xl"
            >
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-warm-100 transition-colors z-10 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close"
              >
                <X size={20} className="text-warm-500" />
              </button>

              {/* Header */}
              <div className="px-6 pt-7 pb-3 text-center">
                <p className="text-2xl mb-1" role="img" aria-label="heart">💛</p>
                <h2 className="font-serif text-xl sm:text-2xl text-warm-800 mb-1.5">
                  How to Treat Karli
                </h2>
                <p className="text-warm-500 text-sm leading-relaxed max-w-md mx-auto">
                  Karli has food allergies, so not everything is safe for her.
                  This is her approved list of treats she can enjoy!
                </p>
              </div>

              {/* Two-column layout */}
              <div className="px-5 sm:px-6 pb-2 flex flex-col sm:flex-row gap-0 sm:gap-5">
                {/* Left column */}
                <div className="flex-1 min-w-0">
                  {leftColumn.map((cat) => (
                    <CategoryCard key={cat.title} cat={cat} />
                  ))}
                </div>
                {/* Right column */}
                <div className="flex-1 min-w-0">
                  {rightColumn.map((cat) => (
                    <CategoryCard key={cat.title} cat={cat} />
                  ))}
                </div>
              </div>

              {/* Birthday section */}
              <div className="mx-5 sm:mx-6 mb-5 bg-copper-400/10 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1.5">
                  <Calendar size={16} className="text-copper-500" />
                  <h3 className="font-semibold text-warm-700 text-xs uppercase tracking-wide">
                    Karli&apos;s Birthday
                  </h3>
                </div>
                <p className="font-serif text-lg text-warm-800 mb-0.5">November 21st</p>
                <p className="text-warm-400 text-xs mb-3">
                  Never miss it!
                </p>
                <button
                  onClick={handleDownloadIcs}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-copper-500 text-white rounded-lg hover:bg-copper-600 transition-colors text-sm font-medium min-h-[44px]"
                >
                  <Download size={16} />
                  Add to My Calendar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
