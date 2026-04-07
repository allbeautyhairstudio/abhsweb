'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Kanban,
  BarChart3,
  CalendarDays,
  Menu,
  X,
  ArrowLeft,
  LogOut,
  TrendingUp,
  Megaphone,
  Paintbrush,
  Inbox,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badgeKey?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: 'Core',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/intake', label: 'Consultation Form', icon: Inbox, badgeKey: 'intake' },
      { href: '/admin/clients', label: 'Clients', icon: Users },
      { href: '/admin/pipeline', label: 'Pipeline', icon: Kanban },
      { href: '/admin/calendar', label: 'Calendar', icon: CalendarDays },
    ],
  },
  {
    label: 'Salon Tools',
    items: [
      { href: '/admin/engagement', label: 'Customer Insights', icon: TrendingUp },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { href: '/admin/promotions', label: 'Promotions', icon: Megaphone },
      { href: '/admin/themes', label: 'Site Themes', icon: Paintbrush },
      { href: '/admin/metrics', label: 'Metrics', icon: BarChart3 },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>({});

  // Poll intake count for badge, subtract locally-viewed entries
  useEffect(() => {
    async function fetchIntakeCount() {
      try {
        const res = await fetch('/api/admin/salon/intake-count');
        if (res.ok) {
          const data = await res.json() as { count: number; ids: number[] };
          // Subtract IDs the user has already viewed (stored in localStorage)
          let viewedIds: Set<number> = new Set();
          try {
            const stored = localStorage.getItem('intake_viewed_ids');
            if (stored) viewedIds = new Set(JSON.parse(stored) as number[]);
          } catch { /* ignore */ }
          const unviewedCount = data.ids.filter(id => !viewedIds.has(id)).length;
          setBadgeCounts(prev => ({ ...prev, intake: unviewedCount }));
        }
      } catch {
        // Silent fail — badge is non-critical
      }
    }

    fetchIntakeCount();
    const interval = setInterval(fetchIntakeCount, 60000);
    // Also re-check when navigating (user may have just viewed an intake)
    const handleFocus = () => fetchIntakeCount();
    window.addEventListener('focus', handleFocus);
    return () => { clearInterval(interval); window.removeEventListener('focus', handleFocus); };
  }, [pathname]);

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false);
      };
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
      };
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const navContent = (
    <>
      {/* Brand */}
      <div className="px-5 py-6 border-b border-sidebar-border">
        <h1 className="text-lg font-bold text-sidebar-primary">
          All Beauty Hair Studio
        </h1>
        <p className="text-xs text-sidebar-accent-foreground/70 mt-1">
          Command Center
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto" aria-label="Admin navigation">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40 mb-1.5 px-3">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  item.href === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(item.href);
                const Icon = item.icon;

                const badgeCount = item.badgeKey ? (badgeCounts[item.badgeKey] || 0) : 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-primary'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="flex-1">{item.label}</span>
                    {badgeCount > 0 && (
                      <span className="min-w-[20px] h-5 flex items-center justify-center px-1.5 text-[10px] font-bold rounded-full bg-amber-500 text-white">
                        {badgeCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-sidebar-border space-y-2">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Website
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors w-full text-left"
        >
          <LogOut size={14} />
          Sign Out
        </button>
        <p className="text-xs text-sidebar-foreground/50">
          BuiltByBas
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile header bar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-sidebar flex items-center px-4 z-40 lg:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>
        <span className="ml-3 text-sm font-bold text-sidebar-primary">
          All Beauty Hair Studio
        </span>
      </div>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-60 bg-sidebar text-sidebar-foreground flex flex-col z-50 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-3 p-1.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent/50 lg:hidden"
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>

        {navContent}
      </aside>
    </>
  );
}
