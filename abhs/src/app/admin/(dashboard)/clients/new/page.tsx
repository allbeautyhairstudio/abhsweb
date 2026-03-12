import { IntakeForm } from '@/components/clients/intake-form';

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-brand-800">New Client</h1>
        <p className="text-muted-foreground mt-1">
          Enter intake data below. All fields are saved to the database and auto-populate prompts.
        </p>
        <p className="text-xs text-brand-600 mt-2 bg-brand-50 border border-brand-200 rounded-lg px-3 py-2 inline-block">
          This form contains client data. AI prompts will be auto-populated from these answers.
        </p>
      </div>
      <IntakeForm />
    </div>
  );
}
