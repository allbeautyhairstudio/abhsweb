/** Types for the Square Bookings integration (public + admin). */

import type { BookingServiceContent } from '@/content/booking-services-data';

/** A bookable service fetched from Square's Catalog API. */
export interface BookableService {
  id: string;
  variationId: string;
  variationVersion: string; // BigInt serialized as string
  name: string;
  durationMinutes: number;
  priceCents: number | null; // price in cents, null if variable pricing
  currency: string;
}

/** A service in the booking cart — Square data paired with local content. */
export interface CartItem {
  service: BookableService;
  content: BookingServiceContent | null; // null for mini services (use Square name)
}

/** A bookable team member from Square's Booking Profiles API. */
export interface TeamMember {
  id: string;
  displayName: string;
}

/** An available time slot from Square's SearchAvailability API. */
export interface AvailableSlot {
  startAt: string; // ISO 8601
  teamMemberId: string;
  serviceVariationId: string;
  durationMinutes: number;
}

/** Customer info submitted with a booking request. */
export interface BookingCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  note?: string;
}

/** Confirmation returned after a successful booking. */
export interface BookingConfirmation {
  bookingId: string;
  startAt: string;
  serviceName: string;
  serviceNames?: string[]; // multiple services in a cart booking
  durationMinutes: number;
  totalDurationMinutes?: number; // combined duration for multi-service
  status: string;
}

/** A segment stored in a booking request's segments_json. */
export interface BookingRequestSegment {
  serviceVariationId: string;
  serviceVariationVersion: string;
  durationMinutes: number;
  serviceName: string;
}

/** A booking request from the local approval queue. */
export interface BookingRequest {
  id: number;
  createdAt: string;
  updatedAt: string;
  status: 'pending_approval' | 'approved' | 'declined' | 'expired';
  clientId: number | null;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  customerNote: string | null;
  requestedStartAt: string;
  totalDurationMin: number;
  segments: BookingRequestSegment[];
  teamMemberId: string;
  squareBookingId: string | null;
  squareCustomerId: string | null;
  respondedAt: string | null;
  declineReason: string | null;
}

/** Confirmation returned after submitting a booking request. */
export interface BookingRequestConfirmation {
  requestId: number;
  status: 'pending_approval';
  requestedStartAt: string;
  serviceNames: string[];
  totalDurationMinutes: number;
}

/** A booking summary for admin calendar/list views. */
export interface BookingSummary {
  id: string;
  startAt: string;
  durationMinutes: number;
  serviceName: string;
  serviceVariationId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerNote: string;
  teamMemberName: string;
  status: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}
