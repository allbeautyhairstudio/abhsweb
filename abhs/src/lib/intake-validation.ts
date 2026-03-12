import { z } from 'zod';

// --- Option value types ---

export const serviceInterestOptions = [
  'cut', 'color', 'cut-and-color', 'consultation', 'not-sure',
] as const;

export const hairTextureOptions = [
  'straight', 'wavy', 'curly', 'coily', 'not-sure',
] as const;

export const hairLengthOptions = [
  'short', 'medium', 'long', 'very-long',
] as const;

export const hairDensityOptions = [
  'fine-thin', 'medium', 'thick-coarse', 'not-sure',
] as const;

export const hairConditionOptions = [
  'healthy', 'damaged', 'dry', 'oily', 'frizzy', 'thinning',
  'color-treated', 'chemically-treated', 'heat-damaged', 'split-ends',
] as const;

export const stylingDescriptionOptions = [
  'low-maintenance', 'simple-styler', 'enjoys-styling',
  'wants-change-nervous', 'no-idea',
] as const;

export const dailyRoutineOptions = [
  'wash-and-go', 'quick-style', 'blow-dry-heat', 'varies-day-to-day',
] as const;

export const shampooFrequencyOptions = [
  'daily', 'every-other-day', '2-3x-week', 'once-week', 'less-than-weekly',
] as const;

export const hairHistoryOptions = [
  'box-dye', 'salon-color', 'highlights-foils', 'balayage',
  'bleach-lightener', 'keratin', 'perm', 'relaxer',
  'extensions', 'henna', 'nothing',
] as const;

export const colorReactionOptions = [
  'yes', 'no', 'not-sure',
] as const;

export const maintenanceFrequencyOptions = [
  'every-4-6-weeks', 'every-8-12-weeks', 'every-3-6-months',
  'as-needed', 'not-sure',
] as const;

export const availabilityOptions = [
  'tue-morning', 'tue-afternoon', 'wed-morning', 'wed-afternoon',
  'thu-morning', 'thu-afternoon', 'flexible',
] as const;

export const contactMethodOptions = [
  'email', 'text', 'either',
] as const;

// --- Schema ---

export const intakeFormSchema = z.object({
  // Step 1: About You
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  pronouns: z.string().max(50).optional(),
  email: z.string().email('Valid email required').max(200),
  phone: z.string().min(1, 'Phone number is required').max(20),
  preferred_contact: z.enum(contactMethodOptions),

  // Step 2: Your Hair
  hair_love_hate: z.string().max(2000).optional(),
  service_interest: z.enum(serviceInterestOptions),
  hair_texture: z.enum(hairTextureOptions),
  hair_length: z.enum(hairLengthOptions),
  hair_density: z.enum(hairDensityOptions),
  hair_condition: z.array(z.enum(hairConditionOptions)).min(1, 'Select at least one'),

  // Step 3: Hair Personality & Routine
  styling_description: z.enum(stylingDescriptionOptions),
  daily_routine: z.enum(dailyRoutineOptions),
  shampoo_frequency: z.enum(shampooFrequencyOptions),

  // Step 4: Hair History
  hair_history: z.array(z.enum(hairHistoryOptions)).min(1, 'Select at least one'),
  color_reaction: z.enum(colorReactionOptions),
  current_products: z.string().max(2000).optional(),

  // Step 5: Goals & Schedule
  what_you_want: z.string().min(1, 'Please tell us what you\'re hoping for').max(3000),
  maintenance_frequency: z.enum(maintenanceFrequencyOptions),
  availability: z.array(z.enum(availabilityOptions)).min(1, 'Select at least one'),

  // Step 6: Show Me — photos handled via separate upload endpoint

  // Step 7: Almost Done
  medical_info: z.string().max(3000).optional(),
  referral_source: z.string().max(500).optional(),
  consent: z.literal(true, { error: 'You must agree to continue' }),
});

export type IntakeFormData = z.infer<typeof intakeFormSchema>;
