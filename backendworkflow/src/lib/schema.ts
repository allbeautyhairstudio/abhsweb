export const CREATE_TABLES_SQL = `
-- Core client table with all 48 intake answers as named columns
CREATE TABLE IF NOT EXISTS clients (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT    NOT NULL DEFAULT (datetime('now')),

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
  q48_consent            INTEGER
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

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(q02_client_name);
CREATE INDEX IF NOT EXISTS idx_client_notes_client ON client_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_client ON deliverables(client_id);
CREATE INDEX IF NOT EXISTS idx_generated_prompts_client ON generated_prompts(client_id);
CREATE INDEX IF NOT EXISTS idx_revenue_client ON revenue_entries(client_id);
`;
