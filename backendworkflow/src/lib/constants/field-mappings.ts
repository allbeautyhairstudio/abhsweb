export interface FieldMapping {
  placeholder: string;
  field: string;
  fallback: string;
  transform?: 'join_array' | 'first_array_item' | 'years_label';
}

export const FIELD_MAPPINGS: FieldMapping[] = [
  // Service type — most common placeholder across all prompt files
  { placeholder: 'YOUR SERVICE TYPE', field: 'q05_service_type', fallback: '[YOUR SERVICE TYPE]' },
  { placeholder: 'SERVICE TYPE', field: 'q05_service_type', fallback: '[SERVICE TYPE]' },

  // Location
  { placeholder: 'YOUR CITY/AREA', field: 'q04_city_state', fallback: '[YOUR CITY/AREA]' },
  { placeholder: 'CITY/AREA', field: 'q04_city_state', fallback: '[CITY/AREA]' },
  { placeholder: 'YOUR AREA', field: 'q04_city_state', fallback: '[YOUR AREA]' },

  // Business name
  { placeholder: 'YOUR BUSINESS NAME', field: 'q01_business_name', fallback: '[YOUR BUSINESS NAME]' },
  { placeholder: 'BUSINESS NAME', field: 'q01_business_name', fallback: '[BUSINESS NAME]' },

  // Services
  { placeholder: 'YOUR TOP 2-3 SERVICES', field: 'q07_services_most_often', fallback: '[YOUR TOP 2-3 SERVICES]' },
  { placeholder: 'TOP SERVICES', field: 'q07_services_most_often', fallback: '[TOP SERVICES]' },
  { placeholder: 'YOUR SPECIALTIES', field: 'q08_most_profitable', fallback: '[YOUR SPECIALTIES]' },
  { placeholder: 'SPECIALTIES', field: 'q08_most_profitable', fallback: '[SPECIALTIES]' },

  // Ideal client
  { placeholder: 'IDEAL CLIENTS', field: 'q14_ideal_client', fallback: '[IDEAL CLIENTS]' },
  { placeholder: 'IDEAL CLIENT DESCRIPTION', field: 'q14_ideal_client', fallback: '[IDEAL CLIENT DESCRIPTION]' },
  { placeholder: 'DESCRIBE YOUR IDEAL CLIENT IN 1-2 SENTENCES', field: 'q14_ideal_client', fallback: '[DESCRIBE YOUR IDEAL CLIENT IN 1-2 SENTENCES]' },
  { placeholder: 'WHO YOU LOVE WORKING WITH', field: 'q14_ideal_client', fallback: '[WHO YOU LOVE WORKING WITH]' },

  // Differentiation
  { placeholder: 'WHAT SETS YOU APART', field: 'q16_problems_solved', fallback: '[WHAT SETS YOU APART]' },

  // Platform
  { placeholder: 'YOUR PLATFORM', field: 'q25_platforms_used', fallback: '[YOUR PLATFORM]', transform: 'first_array_item' },
  { placeholder: 'PLATFORM', field: 'q25_platforms_used', fallback: '[PLATFORM]', transform: 'first_array_item' },
  { placeholder: 'YOUR PLATFORMS', field: 'q25_platforms_used', fallback: '[YOUR PLATFORMS]', transform: 'join_array' },
  { placeholder: 'PLATFORMS', field: 'q25_platforms_used', fallback: '[PLATFORMS]', transform: 'join_array' },

  // Booking link
  { placeholder: 'YOUR BOOKING LINK', field: 'q44_booking_link', fallback: '[YOUR BOOKING LINK]' },
  { placeholder: 'BOOKING LINK', field: 'q44_booking_link', fallback: '[BOOKING LINK]' },

  // Years
  { placeholder: 'YEARS IN BUSINESS', field: 'q06_years_in_business', fallback: '[YEARS IN BUSINESS]', transform: 'years_label' },
  { placeholder: 'YEARS', field: 'q06_years_in_business', fallback: '[YEARS]', transform: 'years_label' },
];

export const YEARS_LABELS: Record<string, string> = {
  'under_1yr': 'less than 1 year',
  '1_3yr': '1-3 years',
  '3_7yr': '3-7 years',
  '7plus': '7+ years',
};
