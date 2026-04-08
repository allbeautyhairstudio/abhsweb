import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Retention Policy | All Beauty Hair Studio',
  description: 'How long we keep your data and your rights regarding it.',
};

export default function RetentionPolicyPage() {
  return (
    <article className="prose-warm">
      <h2 className="font-serif text-2xl text-warm-800 mb-6">Data Retention Policy</h2>
      <p className="text-xs text-warm-400 mb-8">Last updated: March 5, 2026</p>

      <Section title="How Long We Keep Your Data">
        <p>We keep your information only as long as it&apos;s useful for serving you. Here&apos;s the breakdown:</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-warm-200">
                <th className="text-left py-2 pr-4 font-semibold text-warm-700">Data Type</th>
                <th className="text-left py-2 font-semibold text-warm-700">Retention Period</th>
              </tr>
            </thead>
            <tbody className="text-warm-500">
              <tr className="border-b border-warm-100">
                <td className="py-2 pr-4">Client profile (name, contact info)</td>
                <td className="py-2">As long as you&apos;re an active client, plus 2 years after your last appointment</td>
              </tr>
              <tr className="border-b border-warm-100">
                <td className="py-2 pr-4">Consultation form responses</td>
                <td className="py-2">Same as client profile</td>
              </tr>
              <tr className="border-b border-warm-100">
                <td className="py-2 pr-4">Photos</td>
                <td className="py-2">Deleted upon request, or 1 year after last appointment</td>
              </tr>
              <tr className="border-b border-warm-100">
                <td className="py-2 pr-4">Booking history</td>
                <td className="py-2">2 years (for continuity of care and service history)</td>
              </tr>
              <tr className="border-b border-warm-100">
                <td className="py-2 pr-4">Color formulas</td>
                <td className="py-2">Same as client profile (essential for consistent results)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Declined or expired booking requests</td>
                <td className="py-2">Automatically removed after 90 days</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Inactive Clients">
        <p>If you haven&apos;t booked an appointment in over 2 years, your profile may be archived. Archived data is kept in a minimal form (name and contact info only) in case you come back. Full details are removed.</p>
        <p>If you&apos;d like your data removed entirely before the 2-year window, just let us know. We&apos;ll take care of it.</p>
      </Section>

      <Section title="Your Right to Deletion">
        <p>You can request complete deletion of your data at any time. When you do:</p>
        <ul>
          <li>All personal information is permanently removed from our database</li>
          <li>All uploaded photos are deleted from our server</li>
          <li>Color formulas and service notes are removed</li>
          <li>We cannot recover deleted data once it&apos;s gone, so we&apos;ll confirm with you before we proceed</li>
        </ul>
        <p><strong>Note:</strong> We cannot delete data that Square holds independently (booking and payment records). You&apos;d need to contact Square directly for that. See <a href="https://squareup.com/us/en/legal/general/privacy" className="text-forest-500 hover:text-forest-600 underline" target="_blank" rel="noopener noreferrer">Square&apos;s privacy policy</a>.</p>
      </Section>

      <Section title="How to Make a Request">
        <p>Just reach out directly, by email, text, or in person. There&apos;s no formal process or form required. We&apos;ll respond within a few business days and confirm when it&apos;s done.</p>
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
