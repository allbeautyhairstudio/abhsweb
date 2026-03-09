export interface IntakeFieldDef {
  key: string;
  label: string;
  section: number;
  sectionName: string;
  isJsonArray?: boolean;
}

export const INTAKE_FIELDS: IntakeFieldDef[] = [
  // Section 1: Business Snapshot
  { key: 'q01_business_name', label: 'Business Name', section: 1, sectionName: 'Business Snapshot' },
  { key: 'q02_client_name', label: 'Client Name', section: 1, sectionName: 'Business Snapshot' },
  { key: 'q03_email', label: 'Email Address', section: 1, sectionName: 'Business Snapshot' },
  { key: 'q04_city_state', label: 'City & State', section: 1, sectionName: 'Business Snapshot' },
  { key: 'q05_service_type', label: 'Type of Service', section: 1, sectionName: 'Business Snapshot' },
  { key: 'q06_years_in_business', label: 'Years in Business', section: 1, sectionName: 'Business Snapshot' },
  { key: 'q07_services_most_often', label: 'Services Provided Most Often', section: 1, sectionName: 'Business Snapshot' },
  { key: 'q08_most_profitable', label: 'Most Profitable Services', section: 1, sectionName: 'Business Snapshot' },

  // Section 2: Capacity, Workload & Stage
  { key: 'q09_schedule_fullness', label: 'Schedule Fullness', section: 2, sectionName: 'Capacity, Workload & Stage' },
  { key: 'q10_clients_per_week', label: 'Clients Per Week Capacity', section: 2, sectionName: 'Capacity, Workload & Stage' },
  { key: 'q11_current_stage', label: 'Current Business Stage', section: 2, sectionName: 'Capacity, Workload & Stage' },
  { key: 'q12_primary_goal', label: 'Primary Goal', section: 2, sectionName: 'Capacity, Workload & Stage' },
  { key: 'q13_marketing_confidence', label: 'Marketing Confidence (1-5)', section: 2, sectionName: 'Capacity, Workload & Stage' },

  // Section 3: Your Ideal Clients
  { key: 'q14_ideal_client', label: 'Ideal Client Description', section: 3, sectionName: 'Your Ideal Clients' },
  { key: 'q15_clients_to_avoid', label: 'Clients to Avoid', section: 3, sectionName: 'Your Ideal Clients' },
  { key: 'q16_problems_solved', label: 'Problems You Solve', section: 3, sectionName: 'Your Ideal Clients' },

  // Section 4: Current Client Flow
  { key: 'q17_client_sources', label: 'Where Clients Come From', section: 4, sectionName: 'Current Client Flow', isJsonArray: true },
  { key: 'q18_new_clients_month', label: 'New Clients Per Month', section: 4, sectionName: 'Current Client Flow' },
  { key: 'q19_what_works', label: 'What Has Worked', section: 4, sectionName: 'Current Client Flow' },
  { key: 'q20_what_didnt_work', label: 'What Has Not Worked', section: 4, sectionName: 'Current Client Flow' },

  // Section 5: Marketing Reality
  { key: 'q21_marketing_approach', label: 'Current Marketing Approach', section: 5, sectionName: 'Marketing Reality' },
  { key: 'q22_marketing_feelings', label: 'Feelings About Marketing', section: 5, sectionName: 'Marketing Reality', isJsonArray: true },
  { key: 'q23_hardest_now', label: 'What Feels Hardest Right Now', section: 5, sectionName: 'Marketing Reality', isJsonArray: true },

  // Section 6: Social Media & Visibility
  { key: 'q24_social_active', label: 'Social Media Activity Level', section: 6, sectionName: 'Social Media & Visibility' },
  { key: 'q25_platforms_used', label: 'Platforms Used', section: 6, sectionName: 'Social Media & Visibility', isJsonArray: true },
  { key: 'q26_post_frequency', label: 'Posting Frequency', section: 6, sectionName: 'Social Media & Visibility' },
  { key: 'q27_best_content', label: 'Best-Performing Content', section: 6, sectionName: 'Social Media & Visibility' },
  { key: 'q28_stopped_reason', label: 'Why Not More Active', section: 6, sectionName: 'Social Media & Visibility', isJsonArray: true },
  { key: 'q29_tolerable_activity', label: 'Most Tolerable Visibility Activity', section: 6, sectionName: 'Social Media & Visibility' },

  // Section 7: Offers & Pricing
  { key: 'q30_sell_more_of', label: 'Services to Sell More Of', section: 7, sectionName: 'Offers & Pricing' },
  { key: 'q31_sell_less_of', label: 'Services to Sell Less Of', section: 7, sectionName: 'Offers & Pricing' },
  { key: 'q32_average_price', label: 'Average Service Price', section: 7, sectionName: 'Offers & Pricing' },
  { key: 'q33_highest_price', label: 'Highest-Priced Service', section: 7, sectionName: 'Offers & Pricing' },
  { key: 'q34_no_shows_impact', label: 'No-Shows Impact', section: 7, sectionName: 'Offers & Pricing' },

  // Section 8: Tools & Technology
  { key: 'q35_tech_comfort', label: 'Technology Comfort Level', section: 8, sectionName: 'Tools & Technology' },
  { key: 'q36_ai_usage', label: 'AI Tool Usage', section: 8, sectionName: 'Tools & Technology' },
  { key: 'q37_help_wanted', label: 'Help Wanted', section: 8, sectionName: 'Tools & Technology', isJsonArray: true },

  // Section 9: Goals & Constraints
  { key: 'q38_time_for_marketing', label: 'Time Available for Marketing', section: 9, sectionName: 'Goals & Constraints' },
  { key: 'q39_biggest_constraint', label: 'Biggest Constraint', section: 9, sectionName: 'Goals & Constraints' },
  { key: 'q40_success_90_days', label: '90-Day Success Vision', section: 9, sectionName: 'Goals & Constraints' },

  // Section 10: Online Presence
  { key: 'q41_website', label: 'Website', section: 10, sectionName: 'Online Presence' },
  { key: 'q42_instagram_link', label: 'Instagram / Primary Social Link', section: 10, sectionName: 'Online Presence' },
  { key: 'q43_other_social', label: 'Other Social Media Links', section: 10, sectionName: 'Online Presence' },
  { key: 'q44_booking_link', label: 'Booking Link', section: 10, sectionName: 'Online Presence' },

  // Section 11: Trust & Proof
  { key: 'q45_proof_assets', label: 'Proof Assets', section: 11, sectionName: 'Trust & Proof', isJsonArray: true },
  { key: 'q46_google_reviews', label: 'Google Review Count', section: 11, sectionName: 'Trust & Proof' },

  // Section 12: Final
  { key: 'q47_anything_else', label: 'Anything Else Important', section: 12, sectionName: 'Final Thoughts' },
  { key: 'q48_consent', label: 'Consent', section: 12, sectionName: 'Final Thoughts' },
];
