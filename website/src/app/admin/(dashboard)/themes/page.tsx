import { Paintbrush, Sun, Snowflake, Leaf } from 'lucide-react';

export const metadata = { title: 'Site Themes — Admin' };

const previewThemes = [
  { name: 'Default', colors: ['#A0714E', '#3F5A37', '#FAF6F2'], icon: Sun, description: 'Your everyday brand palette' },
  { name: "Valentine's", colors: ['#C45B7A', '#F2D3DC', '#FFF0F3'], icon: Paintbrush, description: 'Pink and red accents for February' },
  { name: 'Summer', colors: ['#E8945A', '#4D9B6E', '#FFFBF0'], icon: Sun, description: 'Bright, warm, golden tones' },
  { name: 'Fall', colors: ['#B8652A', '#8B6914', '#FFF5EB'], icon: Leaf, description: 'Orange, amber, and warm brown' },
  { name: 'Halloween', colors: ['#7B3FA0', '#E8652A', '#1A1025'], icon: Paintbrush, description: 'Purple, orange, and dark vibes' },
  { name: 'Christmas', colors: ['#C41E3A', '#1A6B3C', '#FFF8F0'], icon: Snowflake, description: 'Classic red, green, and gold' },
];

export default function ThemesPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-warm-800 flex items-center gap-3">
          <Paintbrush size={24} className="text-copper-500" />
          Site Themes
        </h1>
        <p className="text-sm text-warm-500 mt-1">
          Switch your site&apos;s look for seasons and holidays — manually or on a schedule.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {previewThemes.map((theme) => {
          const Icon = theme.icon;
          return (
            <div
              key={theme.name}
              className="bg-white rounded-xl border border-warm-200 p-5 hover:border-copper-400 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <Icon size={18} className="text-warm-500" />
                <h2 className="font-semibold text-warm-700 text-sm">{theme.name}</h2>
              </div>
              <div className="flex items-center gap-2 mb-3">
                {theme.colors.map((color) => (
                  <div
                    key={color}
                    className="w-8 h-8 rounded-full border border-warm-200"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p className="text-xs text-warm-500">{theme.description}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-warm-50 rounded-xl border border-warm-200 p-6 text-center">
        <p className="text-warm-500 text-sm">
          Coming soon — schedule themes to auto-switch for every season.
        </p>
      </div>
    </div>
  );
}
