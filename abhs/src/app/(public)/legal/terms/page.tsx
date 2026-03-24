import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use | All Beauty Hair Studio',
  description: 'Terms and conditions for using our website and booking services.',
};

export default function TermsPage() {
  return (
    <article className="prose-warm">
      <h2 className="font-serif text-2xl text-warm-800 mb-6">Terms of Use</h2>
      <p className="text-xs text-warm-400 mb-8">Last updated: March 5, 2026</p>

      <Section title="About These Terms">
        <p>By using the All Beauty Hair Studio website, filling out the new client form, or booking an appointment, you agree to these terms. They&apos;re written to be fair and straightforward -- not to trick you with fine print.</p>
      </Section>

      <Section title="Booking & Appointments">
        <ul>
          <li><strong>Booking requests</strong> are not confirmed until Karli reviews and accepts them. You&apos;ll receive confirmation when your appointment is finalized.</li>
          <li><strong>Same-day bookings</strong> are not available through the website. If you need a last-minute appointment, reach out directly.</li>
          <li>Booking requests expire after <strong>48 hours</strong> if not reviewed -- this is to keep the schedule accurate and fair to everyone.</li>
        </ul>
      </Section>

      <Section title="Cancellation & No-Show Policy">
        <ul>
          <li>Please give at least <strong>24 hours notice</strong> if you need to cancel or reschedule.</li>
          <li>Late cancellations (under 24 hours) or no-shows may result in a fee. Life happens -- just communicate and we&apos;ll figure it out.</li>
          <li>Karli reserves the right to cancel or reschedule appointments due to illness, emergency, or unforeseen circumstances. You&apos;ll always be notified as soon as possible.</li>
        </ul>
      </Section>

      <Section title="New Client Form & Intake">
        <ul>
          <li>The information you provide on the new client form is used exclusively for consultation planning and service delivery.</li>
          <li>Please be honest and thorough -- especially about allergies, sensitivities, and medical conditions. This is for your safety.</li>
          <li>Submitting the form indicates you consent to Karli using this information to prepare for your appointment.</li>
        </ul>
      </Section>

      <Section title="Photos">
        <ul>
          <li>Photos uploaded through the new client form are for consultation purposes only.</li>
          <li>Your photos will <strong>never</strong> be used in marketing, social media, or shared with anyone without your separate, explicit written consent.</li>
          <li>If you&apos;d like your photos removed at any time, just ask.</li>
        </ul>
      </Section>

      <Section title="Service Disclaimers">
        <ul>
          <li>Hair services involve chemical and physical processes. Results vary based on hair history, condition, and texture. Karli will always be upfront about what&apos;s realistic.</li>
          <li>Color corrections and major transformations may require multiple sessions. This will be discussed during your consultation.</li>
          <li>Karli reserves the right to refuse or modify a service if it would compromise the health of your hair or your safety.</li>
        </ul>
      </Section>

      <Section title="Website Use">
        <ul>
          <li>This website is for informational and booking purposes. Don&apos;t use it for anything harmful, illegal, or disruptive.</li>
          <li>Content on this site (text, images, design) belongs to All Beauty Hair Studio unless otherwise noted.</li>
        </ul>
      </Section>

      <Section title="Changes">
        <p>We may update these terms from time to time. The date at the top will always reflect the latest version. Continued use of the site after changes means you accept the updated terms.</p>
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
