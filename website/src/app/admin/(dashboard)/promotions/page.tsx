import { Megaphone, Bell, Sparkles } from 'lucide-react';

export const metadata = { title: 'Promotions — Admin' };

export default function PromotionsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-warm-800 flex items-center gap-3">
          <Megaphone size={24} className="text-copper-500" />
          Promotions
        </h1>
        <p className="text-sm text-warm-500 mt-1">
          Create banners and popups for your site — holiday specials, announcements, anything you want your visitors to see.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-warm-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-copper-500/10 rounded-full flex items-center justify-center">
              <Bell size={20} className="text-copper-500" />
            </div>
            <h2 className="font-semibold text-warm-700">Announcement Bars</h2>
          </div>
          <p className="text-sm text-warm-500">
            Slim bars at the top of your site — perfect for holiday specials, new service announcements, or quick updates. Visitors can dismiss them.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-warm-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-sage-500/10 rounded-full flex items-center justify-center">
              <Sparkles size={20} className="text-sage-500" />
            </div>
            <h2 className="font-semibold text-warm-700">Popup Promotions</h2>
          </div>
          <p className="text-sm text-warm-500">
            Eye-catching modals for bigger moments — seasonal campaigns, gift card promotions, or event announcements. Themed to match any holiday.
          </p>
        </div>
      </div>

      <div className="mt-8 bg-warm-50 rounded-xl border border-warm-200 p-6 text-center">
        <p className="text-warm-500 text-sm">
          Coming soon — your marketing toolkit, right from the dashboard.
        </p>
      </div>
    </div>
  );
}
