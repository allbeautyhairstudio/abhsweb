import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | All Beauty Hair Studio',
  description: 'How we collect, store, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <article className="prose-warm">
      <h2 className="font-serif text-2xl text-warm-800 mb-6">Privacy Policy</h2>
      <p className="text-xs text-warm-400 mb-8">Last updated: March 5, 2026</p>

      <Section title="What We Collect">
        <p>When you fill out the new client form, book an appointment, or interact with our website, we may collect:</p>
        <ul>
          <li><strong>Contact information</strong> — your name, email address, phone number</li>
          <li><strong>Hair and service details</strong> — your hair history, goals, allergies, medical conditions that may affect services, photos you upload</li>
          <li><strong>Booking information</strong> — appointment dates, services requested, preferred times</li>
          <li><strong>Communication preferences</strong> — how you prefer to be contacted (email, text, or call)</li>
        </ul>
        <p>We only collect what we actually need to serve you well. Nothing extra.</p>
      </Section>

      <Section title="How We Store It">
        <p>Your data is stored on our own private server — not in a big tech cloud. We use a local database (SQLite) that sits on our secured server infrastructure. Your information is not shared with data brokers, advertisers, or anyone who has no business seeing it.</p>
        <p>The only external service that receives some of your data is <strong>Square</strong>, which handles appointment booking and payment processing. Square has its own <a href="https://squareup.com/us/en/legal/general/privacy" className="text-forest-500 hover:text-forest-600 underline" target="_blank" rel="noopener noreferrer">privacy policy</a>.</p>
      </Section>

      <Section title="Who Has Access">
        <p>Only Karli Rosario (your stylist and studio owner) and authorized administrative staff have access to your information. We do not sell, rent, or share your personal data with third parties for marketing purposes. Ever.</p>
      </Section>

      <Section title="Photos">
        <p>If you upload photos through the new client form, they are stored securely on our server and are only visible to Karli during your consultation planning. Photos are never shared publicly, used in marketing, or shown to other clients without your explicit written permission.</p>
      </Section>

      <Section title="Cookies & Analytics">
        <p>Our website does not use tracking cookies, third-party analytics, or advertising pixels. We keep it simple and respect your browsing privacy.</p>
      </Section>

      <Section title="Your Rights">
        <p>You have the right to:</p>
        <ul>
          <li><strong>Request a copy</strong> of the personal data we have on file for you</li>
          <li><strong>Request corrections</strong> to any inaccurate information</li>
          <li><strong>Request deletion</strong> of your data (see our <a href="/legal/retention" className="text-forest-500 hover:text-forest-600 underline">Data Retention Policy</a> for details)</li>
        </ul>
        <p>To make any of these requests, just reach out directly — there&apos;s no form to fill out or hoops to jump through.</p>
      </Section>

      <Section title="Changes to This Policy">
        <p>If we update this policy, we&apos;ll note the date at the top. We won&apos;t make sneaky changes — transparency is the whole point.</p>
      </Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h3 className="text-lg font-semibold text-warm-700 mb-3">{title}</h3>
      <div className="text-sm text-warm-500 leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}
