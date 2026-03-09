'use client';

import { AlertTriangle } from 'lucide-react';

export function RaiBanner() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 mb-4">
      <AlertTriangle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-amber-800">Review all AI outputs before sharing with clients</p>
        <p className="text-xs text-amber-600 mt-0.5">
          This prompt contains client data. Paste only into your trusted AI tool. All AI outputs must be reviewed and personalized before delivery.
        </p>
      </div>
    </div>
  );
}
