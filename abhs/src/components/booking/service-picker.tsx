'use client';

import { useState } from 'react';
import {
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Plus,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import type { BookableService, CartItem } from '@/lib/booking-types';
import {
  bookingServices,
  type BookingServiceContent,
} from '@/content/booking-services-data';

const MINI_PREFIX = 'Mini Services \u2014 ';
const MAX_CART_ITEMS = 5;

interface ServicePickerProps {
  services: BookableService[];
  cart: CartItem[];
  onAddToCart: (item: CartItem) => void;
  onRemoveFromCart: (variationId: string) => void;
}

function formatPrice(cents: number | null, currency: string): string {
  if (cents === null) return 'Price varies';
  if (cents === 0) return 'Free';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
}

/** Check if adding a service is blocked by cart rules. */
function getBlockReason(
  content: BookingServiceContent | null,
  cart: CartItem[]
): string | null {
  if (cart.length >= MAX_CART_ITEMS) {
    return `Maximum ${MAX_CART_ITEMS} services per booking`;
  }

  // Consultation is standalone
  if (content?.isStandalone && cart.length > 0) {
    return 'Consultations are booked as a standalone appointment';
  }

  // If cart already has a standalone item, block adding anything else
  if (cart.some((item) => item.content?.isStandalone) && !content?.isStandalone) {
    return 'Remove the consultation to add other services';
  }

  return null;
}

/** Rich service card with full description */
function ServiceCard({
  content,
  service,
  isInCart,
  blockReason,
  onAdd,
  onRemove,
}: {
  content: BookingServiceContent;
  service: BookableService | null;
  isInCart: boolean;
  blockReason: string | null;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  // Show truncated description by default, full on expand
  const previewParagraphs = content.description.slice(0, 2);
  const hasMore = content.description.length > 2 || !!content.bulletPoints;

  return (
    <div
      className={`rounded-xl border transition-all ${
        isInCart
          ? 'border-forest-400 bg-forest-50/50 shadow-sm'
          : 'border-warm-200 bg-white'
      }`}
    >
      {/* Header */}
      <div className="p-4 pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold text-warm-700">
                {content.displayName}
              </h3>
              {content.badge && (
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    content.badge === 'Free'
                      ? 'bg-sage-100 text-sage-700'
                      : 'bg-copper-100 text-copper-700'
                  }`}
                >
                  {content.badge}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-warm-500">
              <span className="flex items-center gap-1">
                <DollarSign size={13} />
                {content.displayPrice}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} />
                {content.displayDuration}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-4 pt-3 pb-2">
        <div className="text-sm text-warm-600 leading-relaxed space-y-2">
          {(expanded ? content.description : previewParagraphs).map((p, i) => (
            <p key={i}>{p}</p>
          ))}

          {expanded && content.bulletPoints && (
            <ul className="space-y-1 pl-1">
              {content.bulletPoints.map((bp, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-forest-500 mt-0.5">&bull;</span>
                  <span>{bp}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {hasMore && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-forest-500 hover:text-forest-600 font-medium mt-2 inline-flex items-center gap-1"
          >
            {expanded ? 'Show less' : 'Read more'}
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}

        {content.consultationRequired && (
          <div className="flex items-start gap-2 mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>An in-person consultation is required before booking this service.</span>
          </div>
        )}
      </div>

      {/* Action button */}
      <div className="px-4 pb-4 pt-1">
        {isInCart ? (
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-sage-100 text-forest-700 rounded-full text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-colors min-h-[44px] group border border-sage-300"
            aria-label={`Remove ${content.displayName} from cart`}
          >
            <Check size={16} className="group-hover:hidden" />
            <X size={16} className="hidden group-hover:block" />
            <span className="group-hover:hidden">Added to Your Visit</span>
            <span className="hidden group-hover:block">Remove</span>
          </button>
        ) : service ? (
          <button
            type="button"
            onClick={onAdd}
            disabled={!!blockReason}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-forest-500 text-white rounded-full text-sm font-medium hover:bg-forest-600 transition-all min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            aria-label={`Add ${content.displayName} to cart`}
          >
            <Plus size={16} />
            Add to Your Visit
          </button>
        ) : (
          <p className="text-xs text-warm-400 italic text-center py-2">
            Not currently available for online booking
          </p>
        )}
        {blockReason && !isInCart && (
          <p className="text-xs text-warm-400 text-center mt-1.5">{blockReason}</p>
        )}
      </div>
    </div>
  );
}

/** Mini service card — compact version for individual mini services */
function MiniServiceCard({
  service,
  isInCart,
  blockReason,
  onAdd,
  onRemove,
}: {
  service: BookableService;
  isInCart: boolean;
  blockReason: string | null;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const displayName = service.name.replace(MINI_PREFIX, '');

  return (
    <div
      className={`flex items-center justify-between gap-3 p-3 rounded-lg border transition-all ${
        isInCart
          ? 'border-forest-400 bg-forest-50/50'
          : 'border-warm-200 bg-white'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-warm-700">{displayName}</div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-warm-400">
          <span className="flex items-center gap-1">
            <DollarSign size={11} />
            {formatPrice(service.priceCents, service.currency)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {formatDuration(service.durationMinutes)}
          </span>
        </div>
      </div>

      {isInCart ? (
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 flex items-center gap-1 px-4 py-2 bg-sage-100 text-forest-700 rounded-full text-xs font-medium hover:bg-red-50 hover:text-red-600 transition-colors min-h-[36px] border border-sage-300"
          aria-label={`Remove ${displayName} from cart`}
        >
          <Check size={12} />
          Added
        </button>
      ) : (
        <button
          type="button"
          onClick={onAdd}
          disabled={!!blockReason}
          className="shrink-0 flex items-center gap-1 px-4 py-2 bg-forest-500 text-white rounded-full text-xs font-medium hover:bg-forest-600 transition-colors min-h-[36px] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          aria-label={`Add ${displayName} to cart`}
        >
          <Plus size={12} />
          Add
        </button>
      )}
    </div>
  );
}

export function ServicePicker({
  services,
  cart,
  onAddToCart,
  onRemoveFromCart,
}: ServicePickerProps) {
  const [miniExpanded, setMiniExpanded] = useState(false);

  if (services.length === 0) {
    return (
      <div className="text-center py-12 text-warm-400">
        <p>No services available right now. Please check back soon.</p>
      </div>
    );
  }

  // Split into main services and mini services
  const mainServices = services.filter((s) => !s.name.startsWith(MINI_PREFIX));
  const miniServices = services.filter((s) => s.name.startsWith(MINI_PREFIX));

  // Check if any mini is in cart
  const hasMiniInCart = miniServices.some((s) =>
    cart.some((item) => item.service.variationId === s.variationId)
  );
  const showMinis = miniExpanded || hasMiniInCart;

  // Get the mini services category content
  const miniCategoryContent = bookingServices.find((c) => c.isMiniCategory);

  // Build ordered content list — match each main service to content
  const mainServiceCards: Array<{
    content: BookingServiceContent;
    service: BookableService | null;
  }> = [];

  // Start from content definitions to preserve Karli's ordering
  for (const content of bookingServices) {
    if (content.isMiniCategory) continue;
    const matched = mainServices.find((s) =>
      s.name.toLowerCase().startsWith(content.squareNamePattern.toLowerCase())
    );
    mainServiceCards.push({ content, service: matched ?? null });
  }

  return (
    <div className="space-y-4">
      {/* Main services */}
      {mainServiceCards.map(({ content, service }) => {
        const isInCart = service
          ? cart.some((item) => item.service.variationId === service.variationId)
          : false;
        const blockReason = getBlockReason(content, cart);

        return (
          <ServiceCard
            key={content.id}
            content={content}
            service={service}
            isInCart={isInCart}
            blockReason={isInCart ? null : blockReason}
            onAdd={() => {
              if (service) {
                onAddToCart({ service, content });
              }
            }}
            onRemove={() => {
              if (service) {
                onRemoveFromCart(service.variationId);
              }
            }}
          />
        );
      })}

      {/* Mini services expandable section */}
      {miniServices.length > 0 && miniCategoryContent && (
        <div className="rounded-xl border border-warm-200 bg-white overflow-hidden">
          {/* Mini category header */}
          <button
            type="button"
            onClick={() => setMiniExpanded(!showMinis)}
            className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-warm-50 transition-colors min-h-[44px]"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Sparkles
                  size={16}
                  className={hasMiniInCart ? 'text-forest-500' : 'text-copper-500'}
                />
                <h3 className="text-base font-semibold text-warm-700">
                  {miniCategoryContent.displayName}
                </h3>
                {hasMiniInCart && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-forest-100 text-forest-600">
                    {cart.filter((item) =>
                      miniServices.some(
                        (ms) => ms.variationId === item.service.variationId
                      )
                    ).length}{' '}
                    selected
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-warm-500">
                <span className="flex items-center gap-1">
                  <DollarSign size={13} />
                  {miniCategoryContent.displayPrice}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={13} />
                  {miniCategoryContent.displayDuration}
                </span>
              </div>
            </div>
            {showMinis ? (
              <ChevronUp size={18} className="text-warm-400 mt-1 shrink-0" />
            ) : (
              <ChevronDown size={18} className="text-warm-400 mt-1 shrink-0" />
            )}
          </button>

          {/* Expanded content */}
          {showMinis && (
            <div className="px-4 pb-4 border-t border-warm-100">
              {/* Category description */}
              <div className="text-sm text-warm-600 leading-relaxed space-y-2 pt-3 pb-4">
                {miniCategoryContent.description.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {miniCategoryContent.bulletPoints && (
                  <p className="font-medium text-warm-700 mt-1">
                    Mini Services are ideal if you:
                  </p>
                )}
                {miniCategoryContent.bulletPoints && (
                  <ul className="space-y-1 pl-1">
                    {miniCategoryContent.bulletPoints.map((bp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-forest-500 mt-0.5">&bull;</span>
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Individual mini service cards */}
              <div className="space-y-2 pl-2 border-l-2 border-forest-200">
                {miniServices.map((service) => {
                  const isInCart = cart.some(
                    (item) => item.service.variationId === service.variationId
                  );
                  const blockReason = getBlockReason(null, cart);

                  return (
                    <MiniServiceCard
                      key={service.variationId}
                      service={service}
                      isInCart={isInCart}
                      blockReason={isInCart ? null : blockReason}
                      onAdd={() => onAddToCart({ service, content: null })}
                      onRemove={() => onRemoveFromCart(service.variationId)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
