'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Loader2,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import type { BookingSummary } from '@/lib/booking-types';

interface ClientBookingsTabProps {
  clientId: number;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function getStatusBadge(status: string): { label: string; className: string } {
  switch (status) {
    case 'ACCEPTED':
      return { label: 'Confirmed', className: 'bg-forest-100 text-forest-700' };
    case 'PENDING':
      return { label: 'Pending', className: 'bg-amber-100 text-amber-700' };
    case 'CANCELLED_BY_SELLER':
    case 'CANCELLED_BY_BUYER':
      return { label: 'Cancelled', className: 'bg-warm-100 text-warm-500' };
    case 'NO_SHOW':
      return { label: 'No Show', className: 'bg-red-100 text-red-600' };
    default:
      return { label: status, className: 'bg-warm-100 text-warm-500' };
  }
}

export function ClientBookingsTab({ clientId }: ClientBookingsTabProps) {
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchBookings() {
      try {
        const res = await fetch(`/api/admin/bookings/client/${clientId}`);
        if (!cancelled && res.ok) {
          const data = await res.json();
          setBookings(data.bookings ?? []);
        }
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchBookings();
    return () => { cancelled = true; };
  }, [clientId]);

  async function handleCancel(booking: BookingSummary) {
    setActionLoading(true);
    setActionError('');

    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: booking.version }),
      });

      if (res.ok) {
        setCancelId(null);
        // Update local state
        setBookings((prev) =>
          prev.map((b) =>
            b.id === booking.id
              ? { ...b, status: 'CANCELLED_BY_SELLER' }
              : b
          )
        );
      } else {
        const data = await res.json().catch(() => null);
        setActionError(data?.error || 'Unable to cancel.');
      }
    } catch {
      setActionError('Connection error.');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={20} className="animate-spin text-forest-500" />
        <span className="ml-2 text-sm text-warm-400">Loading bookings...</span>
      </div>
    );
  }

  const now = new Date();
  const upcoming = bookings.filter(
    (b) => new Date(b.startAt) >= now && b.status === 'ACCEPTED'
  );
  const past = bookings.filter(
    (b) => new Date(b.startAt) < now || b.status !== 'ACCEPTED'
  );

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar size={32} className="text-warm-300 mx-auto mb-3" />
        <p className="text-sm text-warm-400 mb-4">
          No bookings found for this client.
        </p>
        <Link
          href="/book"
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 bg-forest-500 text-white rounded-lg text-sm font-medium hover:bg-forest-600 transition-colors"
        >
          Book Appointment
          <ExternalLink size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-warm-600 mb-3">
            Upcoming ({upcoming.length})
          </h3>
          <div className="space-y-2">
            {upcoming.map((booking) => {
              const badge = getStatusBadge(booking.status);
              return (
                <div
                  key={booking.id}
                  className="bg-white border border-warm-200 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-warm-700">
                        {booking.serviceName}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-warm-500">
                        <Calendar size={12} />
                        {formatDate(booking.startAt)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-warm-500">
                        <Clock size={12} />
                        {formatTime(booking.startAt)} &middot;{' '}
                        {booking.durationMinutes} min
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {/* Cancel action */}
                  <div className="mt-3 pt-3 border-t border-warm-100">
                    {cancelId === booking.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-600">
                          Cancel this appointment?
                        </span>
                        <button
                          onClick={() => handleCancel(booking)}
                          disabled={actionLoading}
                          className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 disabled:opacity-60"
                        >
                          {actionLoading ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            'Yes'
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setCancelId(null);
                            setActionError('');
                          }}
                          className="px-3 py-1 bg-warm-100 text-warm-600 rounded text-xs hover:bg-warm-200"
                        >
                          No
                        </button>
                        {actionError && (
                          <span className="text-xs text-red-500 flex items-center gap-1">
                            <AlertTriangle size={10} />
                            {actionError}
                          </span>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => setCancelId(booking.id)}
                        className="text-xs text-red-500 hover:text-red-600 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-warm-500 mb-3">
            Past & Cancelled ({past.length})
          </h3>
          <div className="space-y-2">
            {past.map((booking) => {
              const badge = getStatusBadge(booking.status);
              return (
                <div
                  key={booking.id}
                  className="bg-warm-50 border border-warm-100 rounded-xl p-4 opacity-70"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="text-sm text-warm-600">
                        {booking.serviceName}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-warm-400">
                        <Calendar size={12} />
                        {formatDate(booking.startAt)}
                        <span>&middot;</span>
                        {formatTime(booking.startAt)}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="pt-2">
        <Link
          href="/admin/calendar"
          className="text-xs text-forest-500 hover:text-forest-600 hover:underline transition-colors"
        >
          View full calendar &rarr;
        </Link>
      </div>
    </div>
  );
}
