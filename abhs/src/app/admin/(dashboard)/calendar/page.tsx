import type { Metadata } from 'next';
import { CalendarView } from '@/components/admin/calendar-view';

export const metadata: Metadata = {
  title: 'Calendar | Admin',
};

export default function CalendarPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-warm-700">Calendar</h1>
      </div>
      <CalendarView />
    </div>
  );
}
