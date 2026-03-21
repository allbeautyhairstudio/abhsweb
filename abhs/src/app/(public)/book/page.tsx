// TEMPORARY: Square widget swap. Custom BookingWizard preserved in
// src/components/booking/. See docs/superpowers/specs/2026-03-20-square-booking-widget-swap.md
// for swap-back plan.
import type { Metadata } from 'next';
import { FloralBloom, FloralDivider } from '@/components/decorative/floral-accents';
import { SquareBookingWidget } from '@/components/booking/square-booking-widget';

export const metadata: Metadata = {
  title: 'Book an Appointment | All Beauty Hair Studio',
  description:
    'Book your next hair appointment with Karli at All Beauty Hair Studio in Wildomar, CA.',
};

export default function BookPage() {
  return (
    <div className="flex flex-col">
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center mb-10">
          <FloralBloom className="w-8 h-8 text-forest-500 mx-auto mb-4" />
          <h1 className="font-serif text-3xl sm:text-4xl text-warm-800 mb-4">
            Book Your Appointment
          </h1>
          <p className="text-warm-500 leading-relaxed max-w-lg mx-auto">
            Pick a time that works for you and I&apos;ll see you in the chair.
          </p>
        </div>
        <SquareBookingWidget />
      </section>
      <FloralDivider className="py-6 text-forest-500" />
    </div>
  );
}
