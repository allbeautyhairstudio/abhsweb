import { z } from 'zod';

/** Schema for searching available time slots. */
export const searchAvailabilitySchema = z.object({
  serviceVariationId: z.string().min(1, 'Service is required'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  teamMemberId: z.string().optional(),
});

export type SearchAvailabilityInput = z.infer<typeof searchAvailabilitySchema>;

/** Segment schema — reused in multi-segment schemas. */
const segmentSchema = z.object({
  serviceVariationId: z.string().min(1, 'Service is required'),
});

const bookingSegmentSchema = z.object({
  serviceVariationId: z.string().min(1, 'Service is required'),
  serviceVariationVersion: z.string().min(1, 'Service version is required'),
  durationMinutes: z.number().int().positive(),
});

/** Customer info schema — shared by single and multi-service bookings. */
const customerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Valid email required').max(200),
  phone: z.string().min(1, 'Phone number is required').max(20),
  note: z.string().max(2000).optional(),
});

/** Schema for creating a new booking (single service — backward compat). */
export const createBookingSchema = z.object({
  serviceVariationId: z.string().min(1, 'Service is required'),
  serviceVariationVersion: z.string().min(1, 'Service version is required'),
  startAt: z.string().min(1, 'Start time is required'),
  teamMemberId: z.string().min(1, 'Team member is required'),
  durationMinutes: z.number().int().positive(),
  customer: customerSchema,
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

/** Schema for searching availability with multiple services. */
export const searchMultiAvailabilitySchema = z.object({
  segments: z.array(segmentSchema).min(1, 'At least one service required').max(5),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  teamMemberId: z.string().optional(),
});

export type SearchMultiAvailabilityInput = z.infer<typeof searchMultiAvailabilitySchema>;

/** Schema for creating a multi-service booking. */
export const createMultiBookingSchema = z.object({
  segments: z.array(bookingSegmentSchema).min(1, 'At least one service required').max(5),
  startAt: z.string().min(1, 'Start time is required'),
  teamMemberId: z.string().min(1, 'Team member is required'),
  customer: customerSchema,
});

export type CreateMultiBookingInput = z.infer<typeof createMultiBookingSchema>;

/** Schema for cancelling a booking (admin). */
export const cancelBookingSchema = z.object({
  version: z.number().int().nonnegative(),
  reason: z.string().max(500).optional(),
});

export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;

/** Schema for rescheduling a booking (admin). */
export const rescheduleBookingSchema = z.object({
  version: z.number().int().nonnegative(),
  startAt: z.string().min(1, 'New start time is required'),
});

export type RescheduleBookingInput = z.infer<typeof rescheduleBookingSchema>;

/** Schema for accepting/declining a pending booking (admin). */
export const acceptBookingSchema = z.object({
  version: z.number().int().nonnegative(),
});

export type AcceptBookingInput = z.infer<typeof acceptBookingSchema>;

/** Segment schema for booking requests — includes serviceName for local storage. */
const requestSegmentSchema = z.object({
  serviceVariationId: z.string().min(1, 'Service is required'),
  serviceVariationVersion: z.string().min(1, 'Service version is required'),
  durationMinutes: z.number().int().positive(),
  serviceName: z.string().min(1, 'Service name is required'),
});

/** Schema for submitting a booking request (public). */
export const bookingRequestSchema = z.object({
  segments: z.array(requestSegmentSchema).min(1, 'At least one service required').max(5),
  startAt: z.string().min(1, 'Start time is required'),
  teamMemberId: z.string().min(1, 'Team member is required'),
  customer: customerSchema,
});

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;

/** Schema for declining a booking request (admin). */
export const declineRequestSchema = z.object({
  reason: z.string().max(500).optional(),
});

export type DeclineRequestInput = z.infer<typeof declineRequestSchema>;
