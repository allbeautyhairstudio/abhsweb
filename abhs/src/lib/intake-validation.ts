import { z } from 'zod';

// --- Option value types ---

export const serviceInterestOptions = [
  'haircut-style', 'low-maintenance-color', 'dimensional-color',
  'mini-service', 'other-not-sure',
] as const;

export const hairTextureOptions = [
  'straight', 'curly', 'wavy', 'frizzy-kinky', 'coily',
] as const;

export const hairLengthOptions = [
  'short', 'medium', 'long',
] as const;

export const hairDensityOptions = [
  'fine', 'medium', 'thick', 'very-thick', 'coarse',
] as const;

export const hairConditionOptions = [
  'hair-loss', 'split-ends', 'itchy-scalp', 'dandruff',
  'heat-damage', 'breakage', 'other',
] as const;

export const stylingDescriptionOptions = [
  'low-maintenance', 'grows-out-well', 'simple-predictable', 'frequent-visits',
] as const;

export const dailyRoutineOptions = [
  'wash-and-go', 'style-when-needed', 'blow-dryer-brush',
  'hot-tools-daily', 'enjoys-styling',
] as const;

export const shampooFrequencyOptions = [
  'daily', 'every-other-day', '2-3x-week', 'once-week', 'less-than-weekly',
] as const;

export const hairHistoryOptions = [
  'box-color', 'henna', 'professional-color', 'splat', 'manic-panic',
  'previous-lightening', 'keratin', 'perm', 'relaxer', 'never-colored',
] as const;

export const colorReactionOptions = [
  'itching', 'burning', 'swelling', 'sores-blisters',
  'rash-hives', 'other', 'no-reaction', 'not-sure',
] as const;

export const maintenanceFrequencyOptions = [
  '3-5-weeks', '6-8-weeks', '10-12-weeks',
  'every-6-months', 'once-a-year',
] as const;

export const availabilityOptions = [
  'tue-morning', 'tue-afternoon', 'wed-morning', 'wed-afternoon',
  'thu-morning', 'thu-afternoon', 'flexible',
] as const;

export const contactMethodOptions = [
  'text', 'email', 'other',
] as const;

// --- Schema ---

export const intakeFormSchema = z.object({
  // Step 1: About You
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  pronouns: z.string().max(50).optional(),
  email: z.string().email('Valid email required').max(200),
  phone: z.string().min(1, 'Phone number is required').max(20),
  preferred_contact: z.array(z.enum(contactMethodOptions)).min(1, 'Select at least one'),

  // Step 2: Your Hair
  hair_love_hate: z.string().max(2000).optional(),
  service_interest: z.array(z.enum(serviceInterestOptions)).min(1, 'Select at least one'),
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
  color_reaction: z.array(z.enum(colorReactionOptions)).min(1, 'Select at least one'),
  product_shampoo: z.string().max(200).optional(),
  product_conditioner: z.string().max(200).optional(),
  product_hair_spray: z.string().max(200).optional(),
  product_dry_shampoo: z.string().max(200).optional(),
  product_heat_protector: z.string().max(200).optional(),
  product_other: z.string().max(200).optional(),

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
