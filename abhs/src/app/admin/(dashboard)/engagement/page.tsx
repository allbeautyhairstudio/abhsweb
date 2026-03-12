import { TrendingUp, Heart, CalendarCheck, DollarSign } from 'lucide-react';

export const metadata = { title: 'Customer Insights — Admin' };

export default function EngagementPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-warm-800 flex items-center gap-3">
          <TrendingUp size={24} className="text-copper-500" />
          Customer Insights
        </h1>
        <p className="text-sm text-warm-500 mt-1">
          Real engagement data from Square — visit history, spending patterns, and more.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-warm-200 p-6 text-center">
          <div className="w-12 h-12 bg-copper-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarCheck size={24} className="text-copper-500" />
          </div>
          <h2 className="font-semibold text-warm-700 mb-2">Visit Tracking</h2>
          <p className="text-sm text-warm-500">
            See total visits, last appointment, and average time between visits for every client.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-warm-200 p-6 text-center">
          <div className="w-12 h-12 bg-sage-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign size={24} className="text-sage-500" />
          </div>
          <h2 className="font-semibold text-warm-700 mb-2">Revenue Per Client</h2>
          <p className="text-sm text-warm-500">
            Total spend, favorite services, and spending trends — know your VIPs.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-warm-200 p-6 text-center">
          <div className="w-12 h-12 bg-forest-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart size={24} className="text-forest-500" />
          </div>
          <h2 className="font-semibold text-warm-700 mb-2">Retention Signals</h2>
          <p className="text-sm text-warm-500">
            No-show rates, cancellation patterns, and engagement scores — spot issues early.
          </p>
        </div>
      </div>

      <div className="mt-8 bg-warm-50 rounded-xl border border-warm-200 p-6 text-center">
        <p className="text-warm-500 text-sm">
          Coming soon — powered by your Square booking data.
        </p>
      </div>
    </div>
  );
}
