'use client';

import { useState } from 'react';

const SQUARE_BOOKING_URL =
  'https://book.squareup.com/appointments/2259437d-19ba-481d-b498-c2741eb33ded/location/A539718ADD7GC/services';

export function SquareBookingWidget() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden min-h-[600px]">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <p className="text-warm-400 text-sm">Loading booking...</p>
          </div>
        )}
        <iframe
          src={SQUARE_BOOKING_URL}
          title="Book an appointment with All Beauty Hair Studio"
          className="w-full border-0"
          style={{ height: '1280px', display: loading ? 'none' : 'block' }}
          onLoad={() => setLoading(false)}
          scrolling="no"
          allow="payment"
        />
      </div>
    </div>
  );
}
