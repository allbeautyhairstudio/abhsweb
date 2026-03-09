export const CREATE_TABLES_SQL = `
-- Core client table with all 48 intake answers as named columns
CREATE TABLE IF NOT EXISTS clients (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT    NOT NULL DEFAULT (datetime('now')),

  -- BUSINESS TYPE
  business_type    TEXT    NOT NULL DEFAULT 'salon',

  -- STATUS & PIPELINE
  status           TEXT    NOT NULL DEFAULT 'inquiry',
  fit_rating       TEXT,
  archetype        TEXT,
  time_tier        INTEGER,

  -- DATES
  inquiry_date       TEXT,
  intake_date        TEXT,
  payment_date       TEXT,
  session_date       TEXT,
  deliverables_sent_date TEXT,
  followup_date      TEXT,
  followup_complete_date TEXT,

  -- FINANCIAL
  price_paid       REAL,
  pricing_tier     TEXT DEFAULT 'beta',

  -- TESTIMONIAL & REFERRAL
  testimonial_received  INTEGER DEFAULT 0,
  testimonial_text      TEXT,
  referral_source       TEXT,
  referrals_given       INTEGER DEFAULT 0,

  -- SECTION 1: Business Snapshot
  q01_business_name      TEXT,
  q02_client_name        TEXT NOT NULL,
  q03_email              TEXT,
  q04_city_state         TEXT,
  q05_service_type       TEXT,
  q06_years_in_business  TEXT,
  q07_services_most_often TEXT,
  q08_most_profitable    TEXT,

  -- SECTION 2: Capacity, Workload & Stage
  q09_schedule_fullness  TEXT,
  q10_clients_per_week   TEXT,
  q11_current_stage      TEXT,
  q12_primary_goal       TEXT,
  q13_marketing_confidence INTEGER,

  -- SECTION 3: Your Ideal Clients
  q14_ideal_client       TEXT,
  q15_clients_to_avoid   TEXT,
  q16_problems_solved    TEXT,

  -- SECTION 4: Current Client Flow
  q17_client_sources     TEXT,
  q18_new_clients_month  TEXT,
  q19_what_works         TEXT,
  q20_what_didnt_work    TEXT,

  -- SECTION 5: Marketing Reality
  q21_marketing_approach TEXT,
  q22_marketing_feelings TEXT,
  q23_hardest_now        TEXT,

  -- SECTION 6: Social Media & Visibility
  q24_social_active      TEXT,
  q25_platforms_used     TEXT,
  q26_post_frequency     TEXT,
  q27_best_content       TEXT,
  q28_stopped_reason     TEXT,
  q29_tolerable_activity TEXT,

  -- SECTION 7: Offers & Pricing
  q30_sell_more_of       TEXT,
  q31_sell_less_of       TEXT,
  q32_average_price      TEXT,
  q33_highest_price      TEXT,
  q34_no_shows_impact    TEXT,

  -- SECTION 8: Tools & Technology
  q35_tech_comfort       TEXT,
  q36_ai_usage           TEXT,
  q37_help_wanted        TEXT,

  -- SECTION 9: Goals & Constraints
  q38_time_for_marketing TEXT,
  q39_biggest_constraint TEXT,
  q40_success_90_days    TEXT,

  -- SECTION 10: Online Presence
  q41_website            TEXT,
  q42_instagram_link     TEXT,
  q43_other_social       TEXT,
  q44_booking_link       TEXT,

  -- SECTION 11: Trust & Proof
  q45_proof_assets       TEXT,
  q46_google_reviews     TEXT,

  -- SECTION 12: Final
  q47_anything_else      TEXT,
  q48_consent            INTEGER,

  -- CONTACT & PERSONAL
  phone                  TEXT,
  birthdate              TEXT,
  preferred_contact      TEXT,
  services_received      TEXT,

  -- CONSENT TRACKING
  consent_terms_accepted INTEGER DEFAULT 0,
  consent_date           TEXT
);

-- Per-client notes
CREATE TABLE IF NOT EXISTS client_notes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id  INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  note_type  TEXT    NOT NULL DEFAULT 'general',
  content    TEXT    NOT NULL
);

-- Deliverable tracking per client
CREATE TABLE IF NOT EXISTS deliverables (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id        INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  deliverable_type TEXT    NOT NULL,
  status           TEXT    NOT NULL DEFAULT 'not_started',
  content          TEXT,
  generated_at     TEXT,
  sent_at          TEXT,
  notes            TEXT
);

-- Auto-populated prompts per client
CREATE TABLE IF NOT EXISTS generated_prompts (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id       INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  prompt_code     TEXT    NOT NULL,
  populated_prompt TEXT   NOT NULL,
  generated_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  ai_output       TEXT
);

-- Revenue tracking
CREATE TABLE IF NOT EXISTS revenue_entries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id   INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  amount      REAL    NOT NULL,
  date        TEXT    NOT NULL,
  description TEXT,
  entry_type  TEXT    NOT NULL DEFAULT 'session'
);

-- Booking requests — local approval queue before Square booking creation
CREATE TABLE IF NOT EXISTS booking_requests (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at          TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT    NOT NULL DEFAULT (datetime('now')),
  status              TEXT    NOT NULL DEFAULT 'pending_approval',
  client_id           INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  customer_first_name TEXT    NOT NULL,
  customer_last_name  TEXT    NOT NULL,
  customer_email      TEXT    NOT NULL,
  customer_phone      TEXT    NOT NULL,
  customer_note       TEXT,
  requested_start_at  TEXT    NOT NULL,
  total_duration_min  INTEGER NOT NULL,
  segments_json       TEXT    NOT NULL,
  team_member_id      TEXT    NOT NULL,
  square_booking_id   TEXT,
  square_customer_id  TEXT,
  responded_at        TEXT,
  decline_reason      TEXT
);

-- Color product lines (brands + sub-lines)
CREATE TABLE IF NOT EXISTS color_lines (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  brand_name TEXT    NOT NULL,
  line_name  TEXT    NOT NULL,
  is_custom  INTEGER NOT NULL DEFAULT 0,
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE(brand_name, line_name)
);

-- Shades per color line
CREATE TABLE IF NOT EXISTS color_shades (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  color_line_id INTEGER NOT NULL REFERENCES color_lines(id) ON DELETE CASCADE,
  shade_name    TEXT    NOT NULL,
  shade_code    TEXT,
  is_custom     INTEGER NOT NULL DEFAULT 0,
  UNIQUE(color_line_id, shade_name)
);

-- Formula records per client visit
CREATE TABLE IF NOT EXISTS color_formulas (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id        INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  service_date     TEXT    NOT NULL,
  color_line_id    INTEGER REFERENCES color_lines(id) ON DELETE SET NULL,
  shade_id         INTEGER REFERENCES color_shades(id) ON DELETE SET NULL,
  custom_shade     TEXT,
  developer_volume TEXT,
  ratio            TEXT,
  processing_time  INTEGER,
  technique        TEXT,
  placement        TEXT,
  notes            TEXT
);

-- Color inventory tracking
CREATE TABLE IF NOT EXISTS color_inventory (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  color_line_id   INTEGER NOT NULL REFERENCES color_lines(id) ON DELETE CASCADE,
  shade_id        INTEGER REFERENCES color_shades(id) ON DELETE SET NULL,
  quantity        REAL    NOT NULL DEFAULT 0,
  minimum_stock   REAL    NOT NULL DEFAULT 1,
  unit            TEXT    NOT NULL DEFAULT 'tubes',
  last_restocked  TEXT,
  updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_clients_business_type ON clients(business_type);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(q02_client_name);
CREATE INDEX IF NOT EXISTS idx_client_notes_client ON client_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_client ON deliverables(client_id);
CREATE INDEX IF NOT EXISTS idx_generated_prompts_client ON generated_prompts(client_id);
CREATE INDEX IF NOT EXISTS idx_revenue_client ON revenue_entries(client_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON booking_requests(status);
CREATE INDEX IF NOT EXISTS idx_booking_requests_start ON booking_requests(requested_start_at);
CREATE INDEX IF NOT EXISTS idx_booking_requests_email ON booking_requests(customer_email);
CREATE INDEX IF NOT EXISTS idx_booking_requests_client ON booking_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_color_lines_brand ON color_lines(brand_name);
CREATE INDEX IF NOT EXISTS idx_color_shades_line ON color_shades(color_line_id);
CREATE INDEX IF NOT EXISTS idx_color_formulas_client ON color_formulas(client_id);
CREATE INDEX IF NOT EXISTS idx_color_formulas_date ON color_formulas(service_date);
CREATE INDEX IF NOT EXISTS idx_color_inventory_line ON color_inventory(color_line_id);
`;
