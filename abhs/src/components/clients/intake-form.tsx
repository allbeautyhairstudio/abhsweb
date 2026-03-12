'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Save, Loader2 } from 'lucide-react';

type FormData = Record<string, string | number | null>;

/** Form section header with description */
function SectionHeader({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="pt-6 pb-2">
      <h3 className="text-lg font-bold text-brand-700">Section {number}: {title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
      <Separator className="mt-3" />
    </div>
  );
}

/** Required field marker */
function Req() {
  return <span className="text-destructive ml-0.5">*</span>;
}

/** Radio group */
function RadioGroup({
  name, label, options, value, onChange, required = false,
}: {
  name: string; label: string; options: { value: string; label: string }[];
  value: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{label}{required && <Req />}</legend>
      <div className="space-y-1.5">
        {options.map(opt => (
          <label key={opt.value} className="flex items-start gap-2 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="mt-0.5 accent-primary"
            />
            <span className="text-sm">{opt.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Checkbox group for multi-select */
function CheckboxGroup({
  name, label, options, value, onChange, required = false,
}: {
  name: string; label: string; options: string[];
  value: string[]; onChange: (v: string[]) => void; required?: boolean;
}) {
  function toggle(opt: string) {
    onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]);
  }
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{label}{required && <Req />}</legend>
      <div className="space-y-1.5">
        {options.map(opt => (
          <label key={opt} className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              name={name}
              checked={value.includes(opt)}
              onChange={() => toggle(opt)}
              className="mt-0.5 accent-primary"
            />
            <span className="text-sm">{opt}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Scale input (1-5) */
function ScaleInput({
  label, value, onChange, required = false,
}: {
  label: string; value: number | null;
  onChange: (v: number) => void; required?: boolean;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{label}{required && <Req />}</legend>
      <div className="flex gap-2 items-center">
        <span className="text-xs text-muted-foreground">Not confident</span>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
              value === n
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-brand-100 text-brand-700'
            }`}
          >
            {n}
          </button>
        ))}
        <span className="text-xs text-muted-foreground">Very confident</span>
      </div>
    </fieldset>
  );
}

export function IntakeForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // Form state
  const [form, setForm] = useState<FormData>({
    status: 'inquiry',
    inquiry_date: new Date().toISOString().slice(0, 10),
  });
  const [checkboxFields, setCheckboxFields] = useState<Record<string, string[]>>({
    q17_client_sources: [],
    q22_marketing_feelings: [],
    q23_hardest_now: [],
    q25_platforms_used: [],
    q28_stopped_reason: [],
    q37_help_wanted: [],
    q45_proof_assets: [],
  });

  function set(key: string, value: string | number | null) {
    setForm(prev => ({ ...prev, [key]: value }));
  }
  function str(key: string): string {
    return (form[key] as string) ?? '';
  }
  function num(key: string): number | null {
    return (form[key] as number) ?? null;
  }

  const socialActive = str('q24_social_active');
  const showActivePosters = socialActive === 'yes' || socialActive === 'sometimes';
  const showNonPosters = socialActive === 'rarely_never';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    // Build payload: merge form + checkbox fields as JSON strings
    const payload: Record<string, unknown> = { ...form };
    for (const [key, arr] of Object.entries(checkboxFields)) {
      if (arr.length > 0) payload[key] = JSON.stringify(arr);
    }

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.details) setErrors(data.details);
        else setErrors({ _form: [data.error || 'Failed to save client'] });
        setSaving(false);
        return;
      }

      router.push(`/admin/clients/${data.id}`);
    } catch {
      setErrors({ _form: ['Network error — please try again'] });
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* Global errors */}
      {errors._form && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {errors._form.join(', ')}
        </div>
      )}

      {/* SECTION 1: Business Snapshot */}
      <Card>
        <CardHeader>
          <SectionHeader number={1} title="Business Snapshot" description="Let's start with the basics about your business." />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="q01">Business name</Label>
            <Input id="q01" value={str('q01_business_name')} onChange={e => set('q01_business_name', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="q02">Client name <Req /></Label>
            <Input id="q02" value={str('q02_client_name')} onChange={e => set('q02_client_name', e.target.value)} required />
            {errors.q02_client_name && <p className="text-xs text-destructive mt-1">{errors.q02_client_name[0]}</p>}
          </div>
          <div>
            <Label htmlFor="q03">Email address</Label>
            <Input id="q03" type="email" value={str('q03_email')} onChange={e => set('q03_email', e.target.value)} />
            {errors.q03_email && <p className="text-xs text-destructive mt-1">{errors.q03_email[0]}</p>}
          </div>
          <div>
            <Label htmlFor="q04">City & state</Label>
            <Input id="q04" value={str('q04_city_state')} onChange={e => set('q04_city_state', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="q05">Type of service</Label>
            <Input id="q05" value={str('q05_service_type')} onChange={e => set('q05_service_type', e.target.value)} placeholder='e.g. "Hair stylist," "Esthetician"' />
          </div>
          <div>
            <Label htmlFor="q06">How long in business?</Label>
            <select id="q06" value={str('q06_years_in_business')} onChange={e => set('q06_years_in_business', e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
              <option value="">Select...</option>
              <option value="under_1yr">Under 1 year</option>
              <option value="1_3yr">1-3 years</option>
              <option value="3_7yr">3-7 years</option>
              <option value="7plus">7+ years</option>
            </select>
          </div>
          <div>
            <Label htmlFor="q07">Services provided most often</Label>
            <Input id="q07" value={str('q07_services_most_often')} onChange={e => set('q07_services_most_often', e.target.value)} placeholder='e.g. "Balayage, cuts, color corrections"' />
          </div>
          <div>
            <Label htmlFor="q08">Most profitable services</Label>
            <Input id="q08" value={str('q08_most_profitable')} onChange={e => set('q08_most_profitable', e.target.value)} placeholder='e.g. "Color corrections and extensions"' />
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2: Capacity, Workload & Stage */}
      <Card>
        <CardHeader>
          <SectionHeader number={2} title="Capacity, Workload & Stage" description="Helps design a system that fits your real life." />
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup name="q09" label="How full is your schedule right now?" required value={str('q09_schedule_fullness')}
            onChange={v => set('q09_schedule_fullness', v)}
            options={[
              { value: 'under_25', label: 'Under 25% — I have a lot of open time' },
              { value: '25_50', label: '25-50% — I have room but it\'s not consistent' },
              { value: '50_75', label: '50-75% — Fairly steady but I want more' },
              { value: '75_100', label: '75-100% — Mostly full or completely booked' },
            ]} />
          <div>
            <Label htmlFor="q10">Clients you can handle per week</Label>
            <Input id="q10" value={str('q10_clients_per_week')} onChange={e => set('q10_clients_per_week', e.target.value)} placeholder="Your best estimate" />
          </div>
          <RadioGroup name="q11" label="Which best describes where you are right now?" required value={str('q11_current_stage')}
            onChange={v => set('q11_current_stage', v)}
            options={[
              { value: 'just_starting', label: 'Just starting out — building from scratch' },
              { value: 'inconsistent', label: 'Established but inconsistent — some good weeks, some slow ones' },
              { value: 'fully_booked', label: 'Fully booked but want better-fit clients or higher pricing' },
              { value: 'overwhelmed', label: 'Overwhelmed or burned out — need to simplify' },
              { value: 'stagnant', label: 'Stagnant or plateaued — stuck and not sure what\'s next' },
            ]} />
          <RadioGroup name="q12" label="Primary goal right now?" required value={str('q12_primary_goal')}
            onChange={v => set('q12_primary_goal', v)}
            options={[
              { value: 'more_clients', label: 'I need more clients' },
              { value: 'consistent_bookings', label: 'I need more consistent bookings' },
              { value: 'better_fit', label: 'I want better-fit clients' },
              { value: 'increase_pricing', label: 'I want to increase my pricing' },
              { value: 'reduce_workload', label: 'I need to reduce my workload and avoid burnout' },
            ]} />
          <ScaleInput label="How confident do you feel about marketing your business?" required
            value={num('q13_marketing_confidence')} onChange={v => set('q13_marketing_confidence', v)} />
        </CardContent>
      </Card>

      {/* SECTION 3: Your Ideal Clients */}
      <Card>
        <CardHeader>
          <SectionHeader number={3} title="Your Ideal Clients" description="Think about the clients you love working with." />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="q14">Your favorite client — the one you wish you had 10 more of. What makes them great?</Label>
            <Textarea id="q14" value={str('q14_ideal_client')} onChange={e => set('q14_ideal_client', e.target.value)} rows={3}
              placeholder='e.g. "They trust my recommendations, show up on time, rebook regularly, and refer friends."' />
          </div>
          <div>
            <Label htmlFor="q15">What type of clients do you prefer NOT to work with?</Label>
            <Textarea id="q15" value={str('q15_clients_to_avoid')} onChange={e => set('q15_clients_to_avoid', e.target.value)} rows={3}
              placeholder='e.g. "Price shoppers," "People who cancel last minute"' />
          </div>
          <div>
            <Label htmlFor="q16">What problems do people typically hire you to solve?</Label>
            <Textarea id="q16" value={str('q16_problems_solved')} onChange={e => set('q16_problems_solved', e.target.value)} rows={3}
              placeholder='e.g. "They want to look put-together without spending hours on styling"' />
          </div>
        </CardContent>
      </Card>

      {/* SECTION 4: Current Client Flow */}
      <Card>
        <CardHeader>
          <SectionHeader number={4} title="Current Client Flow" description="Understanding where your clients come from helps find gaps and opportunities." />
        </CardHeader>
        <CardContent className="space-y-4">
          <CheckboxGroup name="q17" label="Where do most of your clients come from? (check all)" required
            value={checkboxFields.q17_client_sources}
            onChange={v => setCheckboxFields(prev => ({ ...prev, q17_client_sources: v }))}
            options={[
              'Referrals from existing clients', 'Repeat/returning clients',
              'Social media (Instagram, Facebook, TikTok, etc.)', 'Google search / Google Maps',
              'Walk-ins', 'Paid ads (Facebook ads, Google ads, etc.)',
              'Community events or networking', 'Online directories (Yelp, Booksy, StyleSeat, etc.)',
            ]} />
          <div>
            <Label htmlFor="q18">Roughly how many NEW clients per month?</Label>
            <select id="q18" value={str('q18_new_clients_month')} onChange={e => set('q18_new_clients_month', e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
              <option value="">Select...</option>
              <option value="0_2">0-2</option>
              <option value="3_5">3-5</option>
              <option value="6_10">6-10</option>
              <option value="11_20">11-20</option>
              <option value="20plus">20+</option>
            </select>
          </div>
          <div>
            <Label htmlFor="q19">What has worked best for bringing in clients?</Label>
            <Textarea id="q19" value={str('q19_what_works')} onChange={e => set('q19_what_works', e.target.value)} rows={3} />
          </div>
          <div>
            <Label htmlFor="q20">What have you tried that did NOT work?</Label>
            <Textarea id="q20" value={str('q20_what_didnt_work')} onChange={e => set('q20_what_didnt_work', e.target.value)} rows={3} />
          </div>
        </CardContent>
      </Card>

      {/* SECTION 5: Marketing Reality */}
      <Card>
        <CardHeader>
          <SectionHeader number={5} title="Marketing Reality" description="No judgment — most service providers were never taught this stuff." />
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup name="q21" label="Current marketing approach?" required value={str('q21_marketing_approach')}
            onChange={v => set('q21_marketing_approach', v)}
            options={[
              { value: 'no_marketing', label: "I don't really market — clients find me through word of mouth" },
              { value: 'occasional', label: 'I post occasionally but not consistently' },
              { value: 'regular_no_results', label: "I post regularly but I'm not seeing results" },
              { value: 'referrals_only', label: 'I rely almost entirely on referrals and repeat clients' },
              { value: 'tried_unclear', label: "I've tried different things but nothing feels clear" },
              { value: 'overwhelmed', label: "I feel overwhelmed and don't know where to start" },
            ]} />
          <CheckboxGroup name="q22" label="When you think about marketing, you feel: (check all)" required
            value={checkboxFields.q22_marketing_feelings}
            onChange={v => setCheckboxFields(prev => ({ ...prev, q22_marketing_feelings: v }))}
            options={[
              'Excited — I want to learn', 'Overwhelmed — too much to figure out',
              "Confused — I don't know what works", 'Resistant — I just want to do my craft',
              "Exhausted — I've tried and I'm tired", 'Unsure where to start',
            ]} />
          <CheckboxGroup name="q23" label="What feels hardest right now? (check all)" required
            value={checkboxFields.q23_hardest_now}
            onChange={v => setCheckboxFields(prev => ({ ...prev, q23_hardest_now: v }))}
            options={[
              'Knowing what to post or say', 'Finding time for marketing',
              'Understanding social media and what works', 'Getting new clients consistently',
              'Raising prices without losing people', 'Staying consistent with anything',
              "Knowing what's actually working vs. wasting time",
            ]} />
        </CardContent>
      </Card>

      {/* SECTION 6: Social Media & Visibility */}
      <Card>
        <CardHeader>
          <SectionHeader number={6} title="Social Media & Visibility" description="Whether you love social media or avoid it — there's a path forward either way." />
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup name="q24" label="Are you currently active on social media for your business?" required
            value={str('q24_social_active')}
            onChange={v => set('q24_social_active', v)}
            options={[
              { value: 'yes', label: 'Yes — I post regularly' },
              { value: 'sometimes', label: 'Sometimes — I post when I remember or feel motivated' },
              { value: 'rarely_never', label: 'Rarely or never' },
            ]} />

          {/* Conditional: Active posters (Q25-Q27) */}
          {showActivePosters && (
            <div className="space-y-4 pl-4 border-l-2 border-brand-200">
              <CheckboxGroup name="q25" label="Which platforms do you use?" required
                value={checkboxFields.q25_platforms_used}
                onChange={v => setCheckboxFields(prev => ({ ...prev, q25_platforms_used: v }))}
                options={['Instagram', 'Facebook', 'TikTok', 'YouTube', 'Pinterest', 'Google Business Profile']} />
              <div>
                <Label htmlFor="q26">How often do you post?</Label>
                <select id="q26" value={str('q26_post_frequency')} onChange={e => set('q26_post_frequency', e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                  <option value="">Select...</option>
                  <option value="daily">Daily</option>
                  <option value="few_times_week">A few times a week</option>
                  <option value="once_week">Once a week</option>
                  <option value="few_times_month">A few times a month</option>
                  <option value="once_month_less">Once a month or less</option>
                </select>
              </div>
              <div>
                <Label htmlFor="q27">What type of content performs best?</Label>
                <Input id="q27" value={str('q27_best_content')} onChange={e => set('q27_best_content', e.target.value)}
                  placeholder='e.g. "Before and afters," "Reels," "Stories"' />
              </div>
            </div>
          )}

          {/* Conditional: Non-posters (Q28-Q29) */}
          {showNonPosters && (
            <div className="space-y-4 pl-4 border-l-2 border-brand-200">
              <CheckboxGroup name="q28" label="What has stopped you from being more active?" required
                value={checkboxFields.q28_stopped_reason}
                onChange={v => setCheckboxFields(prev => ({ ...prev, q28_stopped_reason: v }))}
                options={[
                  "I don't have time", 'It makes me anxious or uncomfortable',
                  "I'm not sure what to post", "It doesn't seem to work for me",
                  "I'm not interested in social media",
                ]} />
              <RadioGroup name="q29" label="If you could only do ONE visibility activity per week, which would you tolerate most?" required
                value={str('q29_tolerable_activity')}
                onChange={v => set('q29_tolerable_activity', v)}
                options={[
                  { value: 'post_social', label: 'Post one thing on social media' },
                  { value: 'share_story', label: 'Share one Instagram/Facebook story' },
                  { value: 'ask_review', label: 'Ask a client for a review' },
                  { value: 'reach_past_client', label: 'Reach out to a past client' },
                  { value: 'send_text_email', label: 'Send a text or email to existing clients' },
                  { value: 'community_event', label: 'Attend or participate in a local community event' },
                ]} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* SECTION 7: Offers & Pricing */}
      <Card>
        <CardHeader>
          <SectionHeader number={7} title="Offers & Pricing" description="Helps understand what you want to sell more of and whether pricing supports your goals." />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="q30">What services/packages would you like to sell MORE of?</Label>
            <Textarea id="q30" value={str('q30_sell_more_of')} onChange={e => set('q30_sell_more_of', e.target.value)} rows={3} />
          </div>
          <div>
            <Label htmlFor="q31">What would you like to sell LESS of? (optional)</Label>
            <Textarea id="q31" value={str('q31_sell_less_of')} onChange={e => set('q31_sell_less_of', e.target.value)} rows={2} />
          </div>
          <div>
            <Label htmlFor="q32">Average service price</Label>
            <Input id="q32" value={str('q32_average_price')} onChange={e => set('q32_average_price', e.target.value)} placeholder='e.g. "$85," "$150"' />
          </div>
          <div>
            <Label htmlFor="q33">Highest-priced service or package</Label>
            <Input id="q33" value={str('q33_highest_price')} onChange={e => set('q33_highest_price', e.target.value)} placeholder='e.g. "$350 color correction"' />
          </div>
          <RadioGroup name="q34" label="Do no-shows or last-minute cancellations impact your income?" required
            value={str('q34_no_shows_impact')}
            onChange={v => set('q34_no_shows_impact', v)}
            options={[
              { value: 'not_really', label: "Not really — it's rare" },
              { value: 'sometimes', label: 'Sometimes — it happens enough to notice' },
              { value: 'frequently', label: "Frequently — it's a real problem" },
            ]} />
        </CardContent>
      </Card>

      {/* SECTION 8: Tools & Technology */}
      <Card>
        <CardHeader>
          <SectionHeader number={8} title="Tools & Technology" description="No wrong answer — this helps set up your system." />
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup name="q35" label="Comfort with technology?" required value={str('q35_tech_comfort')}
            onChange={v => set('q35_tech_comfort', v)}
            options={[
              { value: 'avoid', label: 'I avoid technology when I can' },
              { value: 'social_only', label: 'I use social media but not strategically' },
              { value: 'comfortable_posting', label: "I'm comfortable posting but not with marketing tools" },
              { value: 'likes_learning', label: 'I like learning new tools and platforms' },
              { value: 'excited_ai', label: "I'm excited about AI and automation" },
            ]} />
          <RadioGroup name="q36" label="Do you currently use any AI tools?" required value={str('q36_ai_usage')}
            onChange={v => set('q36_ai_usage', v)}
            options={[
              { value: 'never', label: "Never — I haven't tried them" },
              { value: 'occasionally', label: "Occasionally — I've played around with them" },
              { value: 'weekly', label: 'Weekly — I use them somewhat regularly' },
              { value: 'daily', label: "Daily — they're part of my routine" },
            ]} />
          <CheckboxGroup name="q37" label="What would you most like help with? (check all)" required
            value={checkboxFields.q37_help_wanted}
            onChange={v => setCheckboxFields(prev => ({ ...prev, q37_help_wanted: v }))}
            options={[
              'Coming up with ideas for content', 'Writing captions, posts, or messages',
              'Building a marketing plan or system', 'Figuring out my offers and pricing',
              'Saving time on repetitive tasks', 'Setting up simple automations',
            ]} />
        </CardContent>
      </Card>

      {/* SECTION 9: Goals & Constraints */}
      <Card>
        <CardHeader>
          <SectionHeader number={9} title="Goals & Constraints" description="Almost done. This helps build a system that fits YOUR life." />
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup name="q38" label="How much time for marketing each week?" required value={str('q38_time_for_marketing')}
            onChange={v => set('q38_time_for_marketing', v)}
            options={[
              { value: 'none', label: "None right now — I'm at full capacity" },
              { value: 'under_30min', label: 'Under 30 minutes' },
              { value: '30_60min', label: '30-60 minutes' },
              { value: '1_2hrs', label: '1-2 hours' },
              { value: '2plus_hrs', label: '2+ hours' },
            ]} />
          <RadioGroup name="q39" label="Biggest constraint right now?" required value={str('q39_biggest_constraint')}
            onChange={v => set('q39_biggest_constraint', v)}
            options={[
              { value: 'time', label: "Time — I'm stretched thin" },
              { value: 'money', label: "Money — I can't invest much" },
              { value: 'confidence', label: "Confidence — I don't trust my marketing instincts" },
              { value: 'consistency', label: "Consistency — I start things but don't stick with them" },
              { value: 'clarity', label: "Clarity — I don't know what my brand should be" },
              { value: 'burnout', label: "Burnout — I'm running on empty" },
              { value: 'direction', label: "Direction — I don't know what actually works" },
            ]} />
          <div>
            <Label htmlFor="q40">What would success look like 90 days from now?</Label>
            <Textarea id="q40" value={str('q40_success_90_days')} onChange={e => set('q40_success_90_days', e.target.value)} rows={3}
              placeholder="Dream a little here. What would feel different?" />
          </div>
        </CardContent>
      </Card>

      {/* SECTION 10: Online Presence */}
      <Card>
        <CardHeader>
          <SectionHeader number={10} title="Online Presence" description="Sharing these helps review your current visibility before the session." />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="q41">Website</Label>
            <Input id="q41" value={str('q41_website')} onChange={e => set('q41_website', e.target.value)} placeholder='URL or "N/A"' />
          </div>
          <div>
            <Label htmlFor="q42">Instagram or primary social link</Label>
            <Input id="q42" value={str('q42_instagram_link')} onChange={e => set('q42_instagram_link', e.target.value)} placeholder='Profile URL or "N/A"' />
          </div>
          <div>
            <Label htmlFor="q43">Other social media links (optional)</Label>
            <Textarea id="q43" value={str('q43_other_social')} onChange={e => set('q43_other_social', e.target.value)} rows={2}
              placeholder="Facebook, TikTok, YouTube, Google Business, etc." />
          </div>
          <div>
            <Label htmlFor="q44">Booking link</Label>
            <Input id="q44" value={str('q44_booking_link')} onChange={e => set('q44_booking_link', e.target.value)} placeholder='Booksy, StyleSeat, Calendly URL or "N/A"' />
          </div>
        </CardContent>
      </Card>

      {/* SECTION 11: Trust & Proof */}
      <Card>
        <CardHeader>
          <SectionHeader number={11} title="Trust & Proof" description="Powerful tools for attracting new clients." />
        </CardHeader>
        <CardContent className="space-y-4">
          <CheckboxGroup name="q45" label="Do you currently have any of the following?" required
            value={checkboxFields.q45_proof_assets}
            onChange={v => setCheckboxFields(prev => ({ ...prev, q45_proof_assets: v }))}
            options={[
              'Google reviews', 'Yelp reviews',
              'Testimonials from clients (written or screenshot)',
              'Before-and-after photos of your work',
              'A portfolio or gallery on your website',
              'Client video testimonials',
              'Awards, certifications, or press features',
              'None of the above',
            ]} />
          <div>
            <Label htmlFor="q46">How many Google reviews does your business have?</Label>
            <select id="q46" value={str('q46_google_reviews')} onChange={e => set('q46_google_reviews', e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
              <option value="">Select...</option>
              <option value="no_profile">I don&apos;t have a Google Business profile</option>
              <option value="0">0</option>
              <option value="1_10">1-10</option>
              <option value="11_25">11-25</option>
              <option value="25_50">25-50</option>
              <option value="50plus">50+</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 12: Final Thoughts + Consent */}
      <Card>
        <CardHeader>
          <SectionHeader number={12} title="Final Thoughts" description="Your space to share anything else." />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="q47">Anything else important about your business, goals, or situation?</Label>
            <Textarea id="q47" value={str('q47_anything_else')} onChange={e => set('q47_anything_else', e.target.value)} rows={4}
              placeholder="Personal constraints, upcoming changes, concerns, hopes — anything." />
          </div>
          <Separator />
          <div className="bg-muted p-4 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={num('q48_consent') === 1}
                onChange={e => set('q48_consent', e.target.checked ? 1 : 0)}
                className="mt-0.5 accent-primary"
              />
              <span className="text-sm">
                I understand that this consultation helps provide clarity and personalized recommendations for my hair — but results depend on factors like hair history, maintenance, and care between appointments. No specific outcomes are guaranteed.
              </span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex items-center gap-4 pt-2 pb-8">
        <Button type="submit" disabled={saving} className="bg-primary hover:bg-brand-600">
          {saving ? (
            <><Loader2 size={16} className="animate-spin" /> Saving...</>
          ) : (
            <><Save size={16} /> Save Client</>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/clients')}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
