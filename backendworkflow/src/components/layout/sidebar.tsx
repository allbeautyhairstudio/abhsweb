'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Kanban,
  BarChart3,
  BookOpen,
  UserPlus,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/clients/new', label: 'New Client', icon: UserPlus },
  { href: '/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/prompts', label: 'Prompt Library', icon: BookOpen },
  { href: '/metrics', label: 'Metrics', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open + Escape key dismissal
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
          AI Marketing Reset
        </h1>
        <p className="text-xs text-sidebar-accent-foreground/70 mt-1">
          Operations Dashboard
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          const Icon = item.icon;

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
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/50">
          v1.0 — Built for Karli
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
          AI Marketing Reset
        </span>
      </div>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar — desktop: always visible, mobile: slide-in drawer */}
      <aside
        className={`fixed left-0 top-0 h-full w-60 bg-sidebar text-sidebar-foreground flex flex-col z-50 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Mobile close button */}
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
