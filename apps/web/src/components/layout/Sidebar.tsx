'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/transactions', label: 'Transactions', icon: '💳' },
  { href: '/contracts', label: 'Contracts', icon: '📄' },
  { href: '/verify', label: 'Verify', icon: '🔍' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-slate-200 flex flex-col p-4 gap-2 shadow-sm">
      <div className="mb-6">
        <span className="text-2xl font-extrabold text-brand-700">
          Pay<span className="text-slate-800">Block</span>
        </span>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-brand-100 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto text-xs text-slate-400">v1.0.0</div>
    </aside>
  );
}
