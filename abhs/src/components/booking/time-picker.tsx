'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { AvailableSlot } from '@/lib/booking-types';

interface TimePickerProps {
  /** Service segments for availability search (one per cart item) */
  segments: Array<{ serviceVariationId: string }>;
  teamMemberId?: string;
  selectedSlot: AvailableSlot | null;
  onSelect: (slot: AvailableSlot) => void;
}

/** Format a date for display: "Mon, Mar 3" */
function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** Format an ISO time for display: "10:00 AM" */
function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** Generate an array of dates for the given week offset */
function getWeekDates(weekOffset: number): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() + weekOffset * 7);

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    dates.push(d);
  }
  return dates;
}

/** Format date as YYYY-MM-DD for API */
function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function TimePicker({
  segments,
  teamMemberId,
  selectedSlot,
  onSelect,
}: TimePickerProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekDates = getWeekDates(weekOffset);

  // Stable key for segments to avoid unnecessary refetches
  const segmentsKey = segments.map((s) => s.serviceVariationId).join(',');

  // Fetch availability when date is selected. Loading-state setters are
  // moved into the async function so they don't run synchronously in the
  // effect body (set-state-in-effect rule).
  useEffect(() => {
    if (!selectedDate || segments.length === 0) return;

    let cancelled = false;

    async function fetchSlots() {
      setLoading(true);
      setError('');
      setSlots([]);
      try {
        const res = await fetch('/api/booking/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            segments,
            date: selectedDate,
            teamMemberId: teamMemberId || undefined,
          }),
        });

        if (!cancelled) {
          if (res.ok) {
            const data = await res.json();
            setSlots(data.slots ?? []);
          } else {
            setError('Unable to load available times. Please try again.');
          }
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError('Connection error. Please try again.');
          setLoading(false);
        }
      }
    }

    fetchSlots();
    return () => { cancelled = true; };
    // segmentsKey (derived from segments) used instead of segments itself to
    // avoid re-fetching when parent recreates the array reference but contents
    // are equivalent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, segmentsKey, teamMemberId]);

  function handleDateSelect(date: Date) {
    const dateStr = toDateString(date);
    setSelectedDate(dateStr);
  }

  function isPast(date: Date): boolean {
    return date < today;
  }

  function isToday(date: Date): boolean {
    return toDateString(date) === toDateString(today);
  }

  return (
    <div className="space-y-6">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
          disabled={weekOffset === 0}
          aria-label="Previous week"
          className="p-2 rounded-lg hover:bg-warm-100 disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <ChevronLeft size={20} />
        </button>

        <span className="text-sm text-warm-500 font-medium">
          {weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>

        <button
          type="button"
          onClick={() => setWeekOffset((w) => Math.min(4, w + 1))}
          disabled={weekOffset >= 4}
          aria-label="Next week"
          className="p-2 rounded-lg hover:bg-warm-100 disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-1">
        {weekDates.map((date) => {
          const dateStr = toDateString(date);
          const past = isPast(date);
          const todayDate = isToday(date);
          const selected = selectedDate === dateStr;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={past}
              onClick={() => handleDateSelect(date)}
              aria-label={formatDateLabel(date)}
              aria-pressed={selected}
              className={`flex flex-col items-center py-2 px-1 rounded-lg text-center transition-all min-h-[44px] focus-visible:outline-2 focus-visible:outline-forest-500 ${
                past
                  ? 'text-warm-300 cursor-not-allowed'
                  : selected
                    ? 'bg-forest-500 text-white shadow-md'
                    : todayDate
                      ? 'bg-sage-100 text-forest-600 hover:bg-sage-200'
                      : 'hover:bg-warm-100 text-warm-600'
              }`}
            >
              <span className="text-[10px] uppercase tracking-wider leading-none">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className="text-lg font-medium leading-tight mt-0.5">
                {date.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Time zone note */}
      <p className="text-xs text-warm-400 text-center">
        All times shown in Pacific Time
      </p>

      {/* Time slots */}
      {selectedDate && (
        <div className="min-h-[120px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-forest-500" />
              <span className="ml-2 text-sm text-warm-400">Checking availability...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-sm text-red-500">{error}</p>
              <button
                type="button"
                onClick={() => setSelectedDate(selectedDate)}
                className="mt-2 text-sm text-forest-500 underline hover:text-forest-600"
              >
                Try again
              </button>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-warm-400">
                No availability on this day. Try another date.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((slot, index) => {
                const isSelected =
                  selectedSlot?.startAt === slot.startAt &&
                  selectedSlot?.teamMemberId === slot.teamMemberId;

                return (
                  <button
                    key={`${slot.startAt}-${slot.teamMemberId}-${index}`}
                    type="button"
                    onClick={() => onSelect(slot)}
                    aria-pressed={isSelected}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all min-h-[44px] focus-visible:outline-2 focus-visible:outline-forest-500 ${
                      isSelected
                        ? 'bg-forest-500 text-white shadow-md'
                        : 'bg-warm-50 text-warm-600 hover:bg-warm-100 border border-warm-200'
                    }`}
                  >
                    {formatTime(slot.startAt)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!selectedDate && (
        <div className="text-center py-8">
          <p className="text-sm text-warm-400">
            Select a date above to see available times.
          </p>
        </div>
      )}
    </div>
  );
}
