'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ClientRow } from '@/lib/queries/clients';
import { PromptsTabContent } from '@/components/prompts/prompts-tab-content';
import { DeliverablesTabContent } from '@/components/deliverables/deliverables-tab-content';
import { NotesTabContent } from '@/components/notes/notes-tab-content';
import { FitAssessmentTabContent } from '@/components/fit-assessment/fit-assessment-tab-content';
import { PhotoGallery } from '@/components/clients/photo-gallery';
import { ClientBookingsTab } from '@/components/admin/client-bookings-tab';
import { FormulaTimeline } from '@/components/color/formula-timeline';
import { SalonSummaryTab } from '@/components/salon/salon-summary-tab';

/** Display a labeled value pair */
function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm mt-0.5">{String(value)}</dd>
    </div>
  );
}

/** Safely parse JSON array string, returning empty array on failure */
function parseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Parse and display JSON array values as badges */
function ArrayField({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  const items = parseJsonArray(value);
  if (items.length === 0) return <Field label={label} value={value} />;
  return (
    <div>
      <dt className="text-xs text-muted-foreground mb-1">{label}</dt>
      <dd className="flex flex-wrap gap-1">
        {items.map((item) => (
          <Badge key={item} variant="secondary" className="text-xs">{item}</Badge>
        ))}
      </dd>
    </div>
  );
}

function ContactLabel({ value }: { value: string | null | undefined }) {
  if (!value) return null;
  const labels: Record<string, string> = {
    email: 'Email',
    call: 'Phone Call',
    text: 'Text Message',
    either: 'Email or Text',
  };
  return <>{labels[value] ?? value}</>;
}

function IntakeDataTab({ client }: { client: ClientRow }) {
  return (
    <div className="space-y-6">
      {/* Contact & Personal */}
      <Card>
        <CardHeader><CardTitle className="text-base text-brand-700">Contact & Personal</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Email" value={client.q03_email} />
            <Field label="Phone" value={client.phone} />
            {client.preferred_contact && (
              <div>
                <dt className="text-xs text-muted-foreground">Preferred Contact</dt>
                <dd className="text-sm mt-0.5"><ContactLabel value={client.preferred_contact} /></dd>
              </div>
            )}
            <Field label="Birthdate" value={client.birthdate} />
            <ArrayField label="Services Received" value={client.services_received} />
          </dl>
        </CardContent>
      </Card>

      {/* Section 1 */}
      <Card>
        <CardHeader><CardTitle className="text-base text-brand-700">Section 1: Business Snapshot</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Business Name" value={client.q01_business_name} />
            <Field label="Client Name" value={client.q02_client_name} />
            <Field label="Email" value={client.q03_email} />
            <Field label="City & State" value={client.q04_city_state} />
            <Field label="Service Type" value={client.q05_service_type} />
            <Field label="Years in Business" value={client.q06_years_in_business} />
            <Field label="Services Most Often" value={client.q07_services_most_often} />
            <Field label="Most Profitable" value={client.q08_most_profitable} />
          </dl>
        </CardContent>
      </Card>

      {/* Section 2 */}
      <Card>
        <CardHeader><CardTitle className="text-base text-brand-700">Section 2: Capacity, Workload & Stage</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Schedule Fullness" value={client.q09_schedule_fullness} />
            <Field label="Clients Per Week" value={client.q10_clients_per_week} />
            <Field label="Current Stage" value={client.q11_current_stage} />
            <Field label="Primary Goal" value={client.q12_primary_goal} />
            <Field label="Marketing Confidence (1-5)" value={client.q13_marketing_confidence} />
          </dl>
        </CardContent>
      </Card>

      {/* Section 3 */}
      <Card>
        <CardHeader><CardTitle className="text-base text-brand-700">Section 3: Ideal Clients</CardTitle></CardHeader>
        <CardContent>
          <dl className="space-y-4">
            <Field label="Favorite Client Description" value={client.q14_ideal_client} />
            <Field label="Clients to Avoid" value={client.q15_clients_to_avoid} />
            <Field label="Problems Solved" value={client.q16_problems_solved} />
          </dl>
        </CardContent>
      </Card>

      {/* Section 4 */}
      <Card>
        <CardHeader><CardTitle className="text-base text-brand-700">Section 4: Client Flow</CardTitle></CardHeader>
        <CardContent>
          <dl className="space-y-4">
            <ArrayField label="Client Sources" value={client.q17_client_sources} />
            <Field label="New Clients/Month" value={client.q18_new_clients_month} />
            <Field label="What Works" value={client.q19_what_works} />
            <Field label="What Didn't Work" value={client.q20_what_didnt_work} />
          </dl>
        </CardContent>
      </Card>

      {/* Section 5 */}
      <Card>
        <CardHeader><CardTitle className="text-base text-brand-700">Section 5: Marketing Reality</CardTitle></CardHeader>
        <CardContent>
          <dl className="space-y-4">
            <Field label="Marketing Approach" value={client.q21_marketing_approach} />
            <ArrayField label="Marketing Feelings" value={client.q22_marketing_feelings} />
            <ArrayField label="What Feels Hardest" value={client.q23_hardest_now} />
          </dl>
        </CardContent>
      </Card>

      {/* Section 6 */}
      <Card>
        <CardHeader><CardTitle className="text-base text-brand-700">Section 6: Social Media & Visibility</CardTitle></CardHeader>
        <CardContent>
          <dl className="space-y-4">
            <Field label="Social Media Active" value={client.q24_social_active} />
            <ArrayField label="Platforms Used" value={client.q25_platforms_used} />
            <Field label="Post Frequency" value={client.q26_post_frequency} />
            <Field label="Best Content" value={client.q27_best_content} />
            <ArrayField label="Stopped Reason" value={client.q28_stopped_reason} />
            <Field label="Tolerable Activity" value={client.q29_tolerable_activity} />
          </dl>
        </CardContent>
      </Card>

      {/* Section 7 */}
      <Card>
        <CardHeader><CardTitle className="text-base text-brand-700">Section 7: Offers & Pricing</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Sell More Of" value={client.q30_sell_more_of} />
            <Field label="Sell Less Of" value={client.q31_sell_less_of} />
            <Field label="Average Price" value={client.q32_average_price} />
            <Field label="Highest Price" value={client.q33_highest_price} />
            <Field label="No-Shows Impact" value={client.q34_no_shows_impact} />
          </dl>
        </CardContent>
      </Card>

      {/* Section 8 */}
      <Card>
        <CardHeader><CardTitle className="text-base text-brand-700">Section 8: Tools & Technology</CardTitle></CardHeader>
        <CardContent>
          <dl className="space-y-4">
            <Field label="Tech Comfort" value={client.q35_tech_comfort} />
            <Field label="AI Usage" value={client.q36_ai_usage} />
            <ArrayField label="Help Wanted" value={client.q37_help_wanted} />
          </dl>
        </CardContent>
      </Card>

      {/* Section 9 */}
      <Card>
        <CardHeader><CardTitle className="text-base text-brand-700">Section 9: Goals & Constraints</CardTitle></CardHeader>
        <CardContent>
          <dl className="space-y-4">
            <Field label="Time for Marketing" value={client.q38_time_for_marketing} />
            <Field label="Biggest Constraint" value={client.q39_biggest_constraint} />
            <Field label="90-Day Success Vision" value={client.q40_success_90_days} />
          </dl>
        </CardContent>
      </Card>

      {/* Section 10 */}
      <Card>
        <CardHeader><CardTitle className="text-base text-brand-700">Section 10: Online Presence</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Website" value={client.q41_website} />
            <Field label="Instagram / Primary Social" value={client.q42_instagram_link} />
            <Field label="Other Social" value={client.q43_other_social} />
            <Field label="Booking Link" value={client.q44_booking_link} />
          </dl>
        </CardContent>
      </Card>

      {/* Section 11 */}
      <Card>
        <CardHeader><CardTitle className="text-base text-brand-700">Section 11: Trust & Proof</CardTitle></CardHeader>
        <CardContent>
          <dl className="space-y-4">
            <ArrayField label="Proof Assets" value={client.q45_proof_assets} />
            <Field label="Google Reviews" value={client.q46_google_reviews} />
          </dl>
        </CardContent>
      </Card>

      {/* Section 12 */}
      <Card>
        <CardHeader><CardTitle className="text-base text-brand-700">Section 12: Final</CardTitle></CardHeader>
        <CardContent>
          <dl className="space-y-4">
            <Field label="Anything Else" value={client.q47_anything_else} />
            <Field label="Consent Given" value={client.q48_consent === 1 ? 'Yes' : client.q48_consent === 0 ? 'No' : null} />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

function OverviewTab({ client }: { client: ClientRow }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base text-brand-700">Client Overview</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Fit Rating" value={client.fit_rating} />
            <Field label="Archetype" value={client.archetype} />
            <Field label="Time Tier" value={client.time_tier ? `Tier ${client.time_tier}` : null} />
            <Field label="Pricing Tier" value={client.pricing_tier} />
            <Field label="Price Paid" value={client.price_paid ? `$${client.price_paid}` : null} />
            <Field label="Referral Source" value={client.referral_source} />
            <Field label="Referrals Given" value={client.referrals_given > 0 ? client.referrals_given : null} />
            <Field label="Testimonial" value={client.testimonial_received ? 'Received' : 'Not yet'} />
          </dl>
          {client.testimonial_text && (
            <div className="mt-4 bg-muted p-4 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Testimonial</p>
              <blockquote className="text-sm italic">&ldquo;{client.testimonial_text}&rdquo;</blockquote>
            </div>
          )}
        </CardContent>
      </Card>

      {client.business_type === 'salon' && (
        <PhotoGallery clientId={client.id} />
      )}
    </div>
  );
}

/** Placeholder tab for upcoming features */
function ComingSoonTab({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <p className="font-medium text-brand-700 mb-1">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export function ClientDetailTabs({ client }: { client: ClientRow }) {
  const isSalon = client.business_type === 'salon';

  return (
    <Tabs defaultValue="overview">
      <TabsList className="w-full justify-start flex-wrap">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="intake">Intake Data</TabsTrigger>
        {isSalon && <TabsTrigger value="salon-summary">AI Summary</TabsTrigger>}
        {isSalon && <TabsTrigger value="bookings">Bookings</TabsTrigger>}
        {isSalon && <TabsTrigger value="color-history">Color History</TabsTrigger>}
        {isSalon && <TabsTrigger value="engagement">Engagement</TabsTrigger>}
        {!isSalon && <TabsTrigger value="fit-assessment">AI Summary</TabsTrigger>}
        {!isSalon && <TabsTrigger value="prompts">Prompts</TabsTrigger>}
        {!isSalon && <TabsTrigger value="deliverables">Deliverables</TabsTrigger>}
        <TabsTrigger value="notes">Notes & History</TabsTrigger>
        {!isSalon && <TabsTrigger value="bookings">Bookings</TabsTrigger>}
      </TabsList>

      <TabsContent value="overview">
        <OverviewTab client={client} />
      </TabsContent>

      <TabsContent value="intake">
        <IntakeDataTab client={client} />
      </TabsContent>

      <TabsContent value="bookings">
        <ClientBookingsTab clientId={client.id} />
      </TabsContent>

      {/* Salon-only tabs */}
      {isSalon && (
        <TabsContent value="salon-summary">
          <SalonSummaryTab clientId={client.id} />
        </TabsContent>
      )}

      {isSalon && (
        <TabsContent value="color-history">
          <FormulaTimeline clientId={client.id} />
        </TabsContent>
      )}

      {isSalon && (
        <TabsContent value="engagement">
          <ComingSoonTab
            title="Engagement Metrics"
            description="Visit frequency, spending patterns, favorite services — powered by Square data. Coming in Phase C."
          />
        </TabsContent>
      )}

      {/* Reset-only tabs */}
      {!isSalon && (
        <TabsContent value="fit-assessment">
          <FitAssessmentTabContent clientId={client.id} client={client} />
        </TabsContent>
      )}

      {!isSalon && (
        <TabsContent value="prompts">
          <PromptsTabContent clientId={client.id} />
        </TabsContent>
      )}

      {!isSalon && (
        <TabsContent value="deliverables">
          <DeliverablesTabContent clientId={client.id} />
        </TabsContent>
      )}

      <TabsContent value="notes">
        <NotesTabContent clientId={client.id} />
      </TabsContent>
    </Tabs>
  );
}
