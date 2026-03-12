'use client';

import { ArrowRight, X, ShoppingBag, ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { CartItem } from '@/lib/booking-types';

const MINI_PREFIX = 'Mini Services \u2014 ';

interface CartSummaryProps {
  cart: CartItem[];
  onRemove: (variationId: string) => void;
  onContinue: () => void;
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

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
}

function getTotals(cart: CartItem[]) {
  const totalMinutes = cart.reduce(
    (sum, item) => sum + item.service.durationMinutes,
    0
  );
  const hasVariablePrice = cart.some((item) => item.service.priceCents === null);
  const totalCents = hasVariablePrice
    ? null
    : cart.reduce((sum, item) => sum + (item.service.priceCents ?? 0), 0);
  const totalPrice =
    totalCents !== null
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
        }).format(totalCents / 100)
      : null;

  return { totalMinutes, totalPrice };
}

/**
 * Desktop sidebar cart — sticky on the right side of the services list.
 * Hidden on mobile (< lg breakpoint).
 */
function DesktopSidebar({ cart, onRemove, onContinue }: CartSummaryProps) {
  const { totalMinutes, totalPrice } = getTotals(cart);

  return (
    <div
      className="hidden lg:block sticky top-20 self-start"
      aria-live="polite"
    >
      <div className="bg-sage-50 border border-sage-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <ShoppingBag size={16} className="text-forest-500" />
          <h3 className="text-sm font-semibold text-warm-700">
            Your Selection
          </h3>
        </div>

        {cart.length === 0 ? (
          <p className="text-sm text-warm-400 py-4 text-center">
            Add services to get started
          </p>
        ) : (
          <>
            {/* Cart items */}
            <div className="space-y-2 mb-4">
              {cart.map((item) => (
                <div
                  key={item.service.variationId}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-warm-700 font-medium text-xs leading-tight block">
                      {getDisplayName(item)}
                    </span>
                    <span className="text-warm-400 text-xs">
                      {getDisplayPrice(item)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(item.service.variationId)}
                    className="shrink-0 p-1 rounded-md text-warm-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    aria-label={`Remove ${getDisplayName(item)} from cart`}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="text-xs border-t border-sage-200 pt-3 mb-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-warm-500">Estimated total</span>
                <span className="font-semibold text-warm-700">
                  {totalPrice ?? 'Varies'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-warm-500">Duration</span>
                <span className="text-warm-600">{formatDuration(totalMinutes)}</span>
              </div>
            </div>

            {/* Continue button */}
            <button
              type="button"
              onClick={onContinue}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-forest-500 text-white rounded-full text-sm font-medium hover:bg-forest-600 transition-colors min-h-[44px]"
            >
              Continue
              <ArrowRight size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Mobile bottom bar — fixed at the bottom of the screen on small screens.
 * Shows compact cart info with expandable details.
 * Hidden on desktop (>= lg breakpoint).
 */
function MobileBottomBar({ cart, onRemove, onContinue }: CartSummaryProps) {
  const [expanded, setExpanded] = useState(false);
  const { totalMinutes, totalPrice } = getTotals(cart);

  if (cart.length === 0) return null;

  return (
    <div
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-sage-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
      aria-live="polite"
    >
      {/* Expandable item list */}
      {expanded && (
        <div className="px-4 pt-3 pb-2 border-b border-warm-100 max-h-[40vh] overflow-y-auto">
          <div className="space-y-2">
            {cart.map((item) => (
              <div
                key={item.service.variationId}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-warm-700 font-medium text-xs">
                    {getDisplayName(item)}
                  </span>
                  <span className="text-warm-400 text-xs ml-2">
                    {getDisplayPrice(item)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(item.service.variationId)}
                  className="shrink-0 p-1 rounded-md text-warm-400 hover:text-red-500"
                  aria-label={`Remove ${getDisplayName(item)} from cart`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compact summary bar */}
      <div className="px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 flex-1 min-w-0 min-h-[44px]"
          aria-label={expanded ? 'Hide cart details' : 'Show cart details'}
        >
          <div className="relative">
            <ShoppingBag size={20} className="text-forest-500" />
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-forest-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {cart.length}
            </span>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-sm font-medium text-warm-700 truncate">
              {totalPrice ?? 'Price varies'} &middot; {formatDuration(totalMinutes)}
            </div>
          </div>
          {expanded ? (
            <ChevronDown size={16} className="text-warm-400 shrink-0" />
          ) : (
            <ChevronUp size={16} className="text-warm-400 shrink-0" />
          )}
        </button>

        <button
          type="button"
          onClick={onContinue}
          className="shrink-0 flex items-center gap-1.5 px-5 py-2.5 bg-forest-500 text-white rounded-full text-sm font-medium hover:bg-forest-600 transition-colors min-h-[44px]"
        >
          Continue
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

/**
 * CartSummary — renders as a sticky sidebar on desktop (lg+) and
 * a fixed bottom bar on mobile (< lg).
 *
 * Both variants share the same props. The wizard renders this component
 * twice: once in the sidebar column (desktop) and once outside the grid (mobile).
 * Use the `variant` prop to control which renders.
 */
export function CartSummary({
  cart,
  onRemove,
  onContinue,
  variant = 'sidebar',
}: CartSummaryProps & { variant?: 'sidebar' | 'mobile' }) {
  if (variant === 'mobile') {
    return (
      <MobileBottomBar cart={cart} onRemove={onRemove} onContinue={onContinue} />
    );
  }
  return (
    <DesktopSidebar cart={cart} onRemove={onRemove} onContinue={onContinue} />
  );
}
