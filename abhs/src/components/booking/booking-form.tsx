'use client';

import { Clock, Calendar, DollarSign } from 'lucide-react';
import type { CartItem, AvailableSlot } from '@/lib/booking-types';

const MINI_PREFIX = 'Mini Services \u2014 ';

interface BookingFormProps {
  cart: CartItem[];
  slot: AvailableSlot;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    note: string;
  };
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
}

function getDisplayName(item: CartItem): string {
  if (item.content) return item.content.displayName;
  return item.service.name.replace(MINI_PREFIX, '');
}

function getDisplayPrice(item: CartItem): string {
  if (item.content) return item.content.displayPrice;
  if (item.service.priceCents === null) return 'Price varies';
  if (item.service.priceCents === 0) return 'Free';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: item.service.currency,
    minimumFractionDigits: 0,
  }).format(item.service.priceCents / 100);
}

export function BookingForm({
  cart,
  slot,
  customer,
  onChange,
  errors,
}: BookingFormProps) {
  const totalMinutes = cart.reduce(
    (sum, item) => sum + item.service.durationMinutes,
    0
  );

  return (
    <div className="space-y-6">
      {/* Booking summary card */}
      <div className="bg-sage-50 rounded-xl p-4 border border-sage-200">
        <h3 className="text-sm font-semibold text-warm-600 mb-3">
          Your Appointment
        </h3>
        <div className="space-y-2 text-sm">
          {/* Services list */}
          {cart.map((item) => (
            <div
              key={item.service.variationId}
              className="flex items-center justify-between text-warm-600"
            >
              <span className="font-medium">{getDisplayName(item)}</span>
              <span className="text-warm-400 text-xs flex items-center gap-1">
                <DollarSign size={11} />
                {getDisplayPrice(item)}
              </span>
            </div>
          ))}

          <div className="border-t border-sage-200 pt-2 mt-2" />

          <div className="flex items-center gap-2 text-warm-500">
            <Calendar size={14} />
            <span>{formatDate(slot.startAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-warm-500">
            <Clock size={14} />
            <span>
              {formatTime(slot.startAt)} &middot;{' '}
              {formatDuration(totalMinutes)}
            </span>
          </div>
        </div>
      </div>

      {/* Customer info fields */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-warm-600">Your Information</h3>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div>
            <label htmlFor="booking-firstName" className="block text-sm text-warm-500 mb-1">
              First Name *
            </label>
            <input
              id="booking-firstName"
              type="text"
              value={customer.firstName}
              onChange={(e) => onChange('firstName', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-forest-500 ${
                errors.firstName ? 'border-red-400' : 'border-warm-200'
              }`}
              autoComplete="given-name"
            />
            {errors.firstName && (
              <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label htmlFor="booking-lastName" className="block text-sm text-warm-500 mb-1">
              Last Name *
            </label>
            <input
              id="booking-lastName"
              type="text"
              value={customer.lastName}
              onChange={(e) => onChange('lastName', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-forest-500 ${
                errors.lastName ? 'border-red-400' : 'border-warm-200'
              }`}
              autoComplete="family-name"
            />
            {errors.lastName && (
              <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="booking-email" className="block text-sm text-warm-500 mb-1">
            Email *
          </label>
          <input
            id="booking-email"
            type="email"
            value={customer.email}
            onChange={(e) => onChange('email', e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-forest-500 ${
              errors.email ? 'border-red-400' : 'border-warm-200'
            }`}
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="booking-phone" className="block text-sm text-warm-500 mb-1">
            Phone *
          </label>
          <input
            id="booking-phone"
            type="tel"
            value={customer.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-forest-500 ${
              errors.phone ? 'border-red-400' : 'border-warm-200'
            }`}
            autoComplete="tel"
          />
          {errors.phone && (
            <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <label htmlFor="booking-note" className="block text-sm text-warm-500 mb-1">
            Note for Karli <span className="text-warm-400">(optional)</span>
          </label>
          <textarea
            id="booking-note"
            value={customer.note}
            onChange={(e) => onChange('note', e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Anything you want Karli to know before your appointment..."
            className="w-full px-3 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none"
          />
        </div>
      </div>

      <p className="text-xs text-warm-400">
        Your request will be sent to Karli for approval. You&#8217;ll receive a confirmation email once approved.
        By booking, you agree to our{' '}
        <a href="/legal/terms" target="_blank" className="text-forest-500 hover:text-forest-600 underline">Terms</a>
        {' '}and{' '}
        <a href="/legal/privacy" target="_blank" className="text-forest-500 hover:text-forest-600 underline">Privacy Policy</a>.
      </p>
    </div>
  );
}
