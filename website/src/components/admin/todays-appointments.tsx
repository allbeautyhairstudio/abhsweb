'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CalendarDays, Clock, User, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BookingSummary, BookingRequest } from '@/lib/booking-types';

interface DisplayItem {
  id: string;
  customerName: string;
  serviceName: string;
  startAt: string;
  durationMinutes: number;
  isPendingRequest: boolean;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function TodaysAppointments() {
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchToday() {
      try {
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const [squareRes, requestsRes] = await Promise.all([
          fetch(`/api/admin/bookings?startDate=${dateStr}&endDate=${dateStr}`),
          fetch(`/api/admin/booking-requests?startDate=${dateStr}&endDate=${dateStr}`),
        ]);

        if (cancelled) return;

        const displayItems: DisplayItem[] = [];

        if (squareRes.ok) {
          const data = await squareRes.json();
          for (const b of (data.bookings ?? []) as BookingSummary[]) {
            if (b.status === 'ACCEPTED' || b.status === 'PENDING') {
              displayItems.push({
                id: b.id,
                customerName: b.customerName,
                serviceName: b.serviceName,
                startAt: b.startAt,
                durationMinutes: b.durationMinutes,
                isPendingRequest: false,
              });
            }
          }
        }

        if (requestsRes.ok) {
          const data = await requestsRes.json();
          for (const r of (data.requests ?? []) as BookingRequest[]) {
            displayItems.push({
              id: `request-${r.id}`,
              customerName: `${r.customerFirstName} ${r.customerLastName}`,
              serviceName: r.segments.map((s) => s.serviceName).join(', '),
              startAt: r.requestedStartAt,
              durationMinutes: r.totalDurationMin,
              isPendingRequest: true,
            });
          }
        }

        // Sort by start time
        displayItems.sort((a, b) => a.startAt.localeCompare(b.startAt));
        setItems(displayItems);
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchToday();
    return () => { cancelled = true; };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-brand-800 flex items-center gap-2">
          <CalendarDays size={20} className="text-forest-500" />
          Today&#8217;s Appointments
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 py-4">
            <Loader2 size={16} className="animate-spin text-forest-500" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground text-sm py-2">
            No appointments today.
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <Link
                key={item.id}
                href="/admin/calendar"
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  item.isPendingRequest
                    ? 'bg-amber-50 hover:bg-amber-100 border border-dashed border-amber-300'
                    : 'bg-forest-50 hover:bg-forest-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-md ${
                    item.isPendingRequest ? 'bg-amber-100' : 'bg-forest-100'
                  }`}>
                    <User size={14} className={
                      item.isPendingRequest ? 'text-amber-700' : 'text-forest-600'
                    } />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-brand-800">
                      {item.customerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.isPendingRequest ? 'Awaiting approval' : item.serviceName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium flex items-center gap-1 ${
                    item.isPendingRequest ? 'text-amber-700' : 'text-forest-600'
                  }`}>
                    <Clock size={12} />
                    {formatTime(item.startAt)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {item.durationMinutes} min
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-muted">
          <Link
            href="/admin/calendar"
            className="text-xs text-forest-500 hover:text-forest-600 hover:underline transition-colors"
          >
            View full calendar &rarr;
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
