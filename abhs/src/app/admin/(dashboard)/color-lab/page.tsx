import { Palette } from 'lucide-react';
import { InventoryOverview } from '@/components/color/inventory-overview';

export const metadata = { title: 'Color Lab — Admin' };

export default function ColorLabPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-warm-800 flex items-center gap-3">
          <Palette size={24} className="text-copper-500" />
          Color Lab
        </h1>
        <p className="text-sm text-warm-500 mt-1">
          Manage your color inventory and track low-stock items. Formula history lives on each client&apos;s Color History tab.
        </p>
      </div>

      <InventoryOverview />
    </div>
  );
}
