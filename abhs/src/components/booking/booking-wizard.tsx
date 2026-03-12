'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Scissors,
  Calendar,
  User,
  Clock,
} from 'lucide-react';
import { FloralBloom, FloralDivider } from '@/components/decorative/floral-accents';
import { ServicePicker } from './service-picker';
import { CartSummary } from './cart-summary';
import { TimePicker } from './time-picker';
import { BookingForm } from './booking-form';
import type {
  BookableService,
  CartItem,
  AvailableSlot,
  BookingRequestConfirmation,
} from '@/lib/booking-types';

type Step = 1 | 2 | 3;
type Status = 'idle' | 'loading-services' | 'submitting' | 'success' | 'error';

const stepLabels: Record<Step, { icon: typeof Scissors; label: string }> = {
  1: { icon: Scissors, label: 'Choose Services' },
  2: { icon: Calendar, label: 'Pick a Time' },
  3: { icon: User, label: 'Your Info' },
};

export function BookingWizard() {
  const [step, setStep] = useState<Step>(1);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Services from Square
  const [services, setServices] = useState<BookableService[]>([]);
  const [teamMemberIds, setTeamMemberIds] = useState<string[]>([]);

  // Cart (replaces single selectedService)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [customer, setCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    note: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Confirmation
  const [confirmation, setConfirmation] = useState<BookingRequestConfirmation | null>(null);

  // Load services on mount
  useEffect(() => {
    let cancelled = false;
    setStatus('loading-services');

    async function loadServices() {
      try {
        const res = await fetch('/api/booking/services');
        if (!cancelled && res.ok) {
          const data = await res.json();
          setServices(data.services ?? []);
          setTeamMemberIds(
            (data.teamMembers ?? []).map((t: { id: string }) => t.id)
          );
          setStatus('idle');
        } else if (!cancelled) {
          setStatus('error');
          setErrorMessage('Unable to load services. Please refresh the page.');
        }
      } catch {
        if (!cancelled) {
          setStatus('error');
          setErrorMessage('Connection error. Please check your connection and refresh.');
        }
      }
    }

    loadServices();
    return () => { cancelled = true; };
  }, []);

  // Cart handlers
  function handleAddToCart(item: CartItem) {
    // No duplicates
    if (cart.some((c) => c.service.variationId === item.service.variationId)) return;
    setCart((prev) => [...prev, item]);
  }

  function handleRemoveFromCart(variationId: string) {
    setCart((prev) => prev.filter((c) => c.service.variationId !== variationId));
  }

  function handleContinueFromCart() {
    if (cart.length === 0) return;
    setSelectedSlot(null); // Reset time when cart changes
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSlotSelect(slot: AvailableSlot) {
    setSelectedSlot(slot);
  }

  function handleCustomerChange(field: string, value: string) {
    setCustomer((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  // Validation
  function validateStep(s: Step): boolean {
    const newErrors: Record<string, string> = {};

    if (s === 1 && cart.length === 0) {
      newErrors.service = 'Please select at least one service';
    }

    if (s === 2 && !selectedSlot) {
      newErrors.slot = 'Please select a date and time';
    }

    if (s === 3) {
      if (!customer.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!customer.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!customer.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email))
        newErrors.email = 'Please enter a valid email';
      if (!customer.phone.trim()) newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function nextStep() {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 3) as Step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 1) as Step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Submit — multi-segment booking
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep(3)) return;
    if (cart.length === 0 || !selectedSlot) return;

    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/booking/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segments: cart.map((item) => ({
            serviceVariationId: item.service.variationId,
            serviceVariationVersion: item.service.variationVersion,
            durationMinutes: item.service.durationMinutes,
            serviceName: item.content?.displayName ?? item.service.name,
          })),
          startAt: selectedSlot.startAt,
          teamMemberId: selectedSlot.teamMemberId,
          customer: {
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone,
            note: customer.note || undefined,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setConfirmation(data.booking);
        setStatus('success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const data = await res.json().catch(() => null);
        setErrorMessage(
          data?.error || 'Something went wrong. Please try again.'
        );
        setStatus('error');
      }
    } catch {
      setErrorMessage('Connection error. Please try again.');
      setStatus('error');
    }
  }

  // Total duration for display
  const totalDuration = cart.reduce(
    (sum, item) => sum + item.service.durationMinutes,
    0
  );

  // --- Renders ---

  // Loading services
  if (status === 'loading-services') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Loader2 size={32} className="animate-spin text-forest-500 mx-auto" />
        <p className="text-sm text-warm-400 mt-4">Loading services...</p>
      </div>
    );
  }

  // Success state — always shows pending approval
  if (status === 'success' && confirmation) {
    const displayNames = confirmation.serviceNames;
    const displayDuration = confirmation.totalDurationMinutes;

    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center">
          <FloralBloom className="w-12 h-12 text-forest-500 mx-auto mb-4" />
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-amber-100">
            <Clock size={32} className="text-amber-600" />
          </div>
          <h1 className="text-2xl font-serif text-warm-700 mb-2">
            Booking Request Sent!
          </h1>
          <p className="text-warm-500 mb-8">
            Your appointment request has been submitted. Karli will confirm it shortly.
          </p>
        </div>

        <div className="bg-sage-50 rounded-xl p-6 border border-sage-200 mb-8">
          <div className="flex items-center gap-2 px-3 py-2 mb-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            <Clock size={14} className="shrink-0" />
            <span>Pending Karli&#8217;s approval &#8212; you&#8217;ll get a confirmation email once approved.</span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-warm-500">
                {displayNames.length > 1 ? 'Services' : 'Service'}
              </span>
              <span className="font-medium text-warm-700 text-right">
                {displayNames.join(', ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-warm-500">Date</span>
              <span className="font-medium text-warm-700">
                {new Date(confirmation.requestedStartAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-warm-500">Time</span>
              <span className="font-medium text-warm-700">
                {new Date(confirmation.requestedStartAt).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-warm-500">Duration</span>
              <span className="font-medium text-warm-700">
                {displayDuration} min
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-warm-500 text-center mb-2">
          You&#8217;ll receive a confirmation email once Karli approves your request.
        </p>
        <p className="text-sm text-warm-400 text-center italic mb-8">
          See you soon! &#8212; Karli
        </p>

        <FloralDivider className="text-copper-500 my-8" />

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-forest-500 text-white rounded-full text-sm font-medium hover:bg-forest-600 transition-colors min-h-[44px]"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Main wizard
  return (
    <div className="px-4 py-12">
      {/* Header — centered, narrow */}
      <div className="max-w-2xl mx-auto text-center mb-8">
        <FloralBloom className="w-10 h-10 text-forest-500 mx-auto mb-3" />
        <h1 className="text-2xl font-serif text-warm-700 mb-2">
          Book an Appointment
        </h1>
        <p className="text-sm text-warm-500">
          Choose your services, pick a time, and you&#8217;re all set.
        </p>
      </div>

      {/* Step indicator — centered, narrow */}
      <div className="max-w-2xl mx-auto flex items-center justify-center gap-2 mb-8">
        {([1, 2, 3] as Step[]).map((s) => {
          const StepIcon = stepLabels[s].icon;
          const isActive = step === s;
          const isDone = step > s;

          return (
            <div key={s} className="flex items-center gap-2">
              {s > 1 && (
                <div
                  className={`w-8 h-px ${
                    isDone ? 'bg-forest-500' : 'bg-warm-200'
                  }`}
                />
              )}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-forest-500 text-white'
                    : isDone
                      ? 'bg-forest-100 text-forest-600'
                      : 'bg-warm-100 text-warm-400'
                }`}
              >
                {isDone ? (
                  <CheckCircle size={12} />
                ) : (
                  <StepIcon size={12} />
                )}
                <span className="hidden sm:inline">{stepLabels[s].label}</span>
                <span className="sm:hidden">{s}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="max-w-2xl mx-auto">
        <FloralDivider className="text-copper-500 mb-8" />
      </div>

      {/* Step content */}
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <>
            {/* Two-column layout: services left, cart sidebar right on desktop */}
            <div className="max-w-5xl mx-auto lg:grid lg:grid-cols-[1fr_300px] lg:gap-8 lg:items-start">
              <div>
                <h2 className="text-lg font-serif text-warm-700 mb-1">
                  What Are You Coming In For?
                </h2>
                <p className="text-sm text-warm-400 mb-6">
                  Select the services you&#8217;d like to book. You can add multiple services to one appointment.
                </p>

                <ServicePicker
                  services={services}
                  cart={cart}
                  onAddToCart={handleAddToCart}
                  onRemoveFromCart={handleRemoveFromCart}
                />

                {errors.service && (
                  <p className="text-sm text-red-500 mt-3">{errors.service}</p>
                )}

                {/* Bottom spacer on mobile so content isn't hidden behind the fixed bottom bar */}
                {cart.length > 0 && (
                  <div className="h-24 lg:hidden" />
                )}
              </div>

              {/* Desktop sticky sidebar cart */}
              <CartSummary
                cart={cart}
                onRemove={handleRemoveFromCart}
                onContinue={handleContinueFromCart}
                variant="sidebar"
              />
            </div>

            {/* Mobile fixed bottom cart bar */}
            <CartSummary
              cart={cart}
              onRemove={handleRemoveFromCart}
              onContinue={handleContinueFromCart}
              variant="mobile"
            />
          </>
        )}

        {step === 2 && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg font-serif text-warm-700 mb-1">
              When Works for You?
            </h2>
            <p className="text-sm text-warm-400 mb-6">
              Pick a date and time that fits your schedule.
              {totalDuration > 0 && (
                <span className="text-warm-500 font-medium">
                  {' '}Your appointment is {totalDuration} min total.
                </span>
              )}
            </p>

            <TimePicker
              segments={cart.map((item) => ({
                serviceVariationId: item.service.variationId,
              }))}
              teamMemberId={
                teamMemberIds.length === 1 ? teamMemberIds[0] : undefined
              }
              selectedSlot={selectedSlot}
              onSelect={handleSlotSelect}
            />

            {errors.slot && (
              <p className="text-sm text-red-500 mt-3">{errors.slot}</p>
            )}
          </div>
        )}

        {step === 3 && cart.length > 0 && selectedSlot && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg font-serif text-warm-700 mb-1">
              Almost There!
            </h2>
            <p className="text-sm text-warm-400 mb-6">
              Confirm your details and you&#8217;re all set.
            </p>

            <BookingForm
              cart={cart}
              slot={selectedSlot}
              customer={customer}
              onChange={handleCustomerChange}
              errors={errors}
            />
          </div>
        )}

        {/* Error banner */}
        {status === 'error' && errorMessage && (
          <div className="max-w-2xl mx-auto mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="max-w-2xl mx-auto flex items-center justify-between mt-8 pt-6 border-t border-warm-100">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center gap-2 px-4 py-2 text-sm text-warm-500 hover:text-warm-700 transition-colors min-h-[44px]"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          ) : (
            <div />
          )}

          {step === 1 ? (
            /* Step 1 uses CartSummary's Continue button — no button here */
            <div />
          ) : step === 2 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 bg-forest-500 text-white rounded-full text-sm font-medium hover:bg-forest-600 transition-colors min-h-[44px]"
            >
              Continue
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="flex items-center gap-2 px-6 py-3 bg-forest-500 text-white rounded-full text-sm font-medium hover:bg-forest-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send Request
                  <CheckCircle size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
