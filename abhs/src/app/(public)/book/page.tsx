import type { Metadata } from 'next';
import { BookingWizard } from '@/components/booking/booking-wizard';

export const metadata: Metadata = {
  title: 'Book an Appointment | All Beauty Hair Studio',
  description:
    'Book your next hair appointment with Karli at All Beauty Hair Studio in Wildomar, CA.',
};

export default function BookPage() {
  return <BookingWizard />;
}
