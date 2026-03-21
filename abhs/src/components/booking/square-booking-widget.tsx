'use client';

import { useEffect, useRef, useState } from 'react';

const SQUARE_WIDGET_URL =
  'https://square.site/appointments/buyer/widget/2259437d-19ba-481d-b498-c2741eb33ded/A539718ADD7GC.js';

export function SquareBookingWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement('script');
    script.src = SQUARE_WIDGET_URL;
    script.async = true;
    script.onload = () => setLoading(false);
    script.onerror = () => { setLoading(false); setError(true); };
    container.appendChild(script);

    return () => {
      if (container.contains(script)) {
        container.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 min-h-[400px]">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <p className="text-warm-400 text-sm">Loading booking...</p>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center py-16">
            <p className="text-warm-500 text-sm">
              Booking is temporarily unavailable. Please call us to schedule.
            </p>
          </div>
        )}
        <div ref={containerRef} />
      </div>
    </div>
  );
}
