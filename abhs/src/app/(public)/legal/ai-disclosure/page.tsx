import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Disclosure | All Beauty Hair Studio',
  description: 'How we use technology responsibly in our services.',
};

export default function AiDisclosurePage() {
  return (
    <article className="prose-warm">
      <h2 className="font-serif text-2xl text-warm-800 mb-6">Responsible AI Disclosure</h2>
      <p className="text-xs text-warm-400 mb-8">Last updated: March 5, 2026</p>

      <Section title="Why This Page Exists">
        <p>Transparency matters. We use some technology behind the scenes to help us serve you better, and you deserve to know exactly what that looks like. No mystery, no buzzwords -- just honesty.</p>
      </Section>

      <Section title="What We Use">
        <p>When you submit the new client intake form, our system runs a simple <strong>algorithmic review</strong> to help Karli prepare for your consultation. This is not generative AI writing your hair plan -- it&apos;s a scoring system that highlights things like:</p>
        <ul>
          <li>How ready you are for a consultation based on the info you provided</li>
          <li>Whether there are any flags Karli should be aware of (allergies, medical conditions, complex color history)</li>
          <li>Key details that help her prepare so your appointment time is focused on you, not paperwork</li>
        </ul>
      </Section>

      <Section title="What We Don't Do">
        <ul>
          <li><strong>AI never makes decisions about you.</strong> Karli personally reviews every intake, every flag, every score. The technology organizes information -- she decides what to do with it.</li>
          <li><strong>No generative AI touches your service plan.</strong> Your consultation, recommendations, and hair design come from Karli&apos;s professional experience and judgment.</li>
          <li><strong>Your data never leaves our server for AI processing.</strong> The scoring happens locally on our own infrastructure. Your information is not sent to OpenAI, Google, or any external AI service.</li>
          <li><strong>No profiling or automated decision-making.</strong> We don&apos;t use your data to make automated decisions about pricing, service availability, or anything else.</li>
        </ul>
      </Section>

      <Section title="Our Principles">
        <ul>
          <li><strong>Human first.</strong> Technology assists -- it never replaces the human connection between Karli and her clients.</li>
          <li><strong>Transparent always.</strong> If we use technology in a new way, we&apos;ll update this page.</li>
          <li><strong>Your data, your control.</strong> See our <a href="/legal/privacy" className="text-forest-500 hover:text-forest-600 underline">Privacy Policy</a> for details on data access and deletion.</li>
        </ul>
      </Section>

      <Section title="Questions?">
        <p>If you have any questions about how we use technology, reach out directly. We&apos;re happy to explain anything in more detail.</p>
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
