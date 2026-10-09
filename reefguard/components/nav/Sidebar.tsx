'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { label: 'Dashboard', href: '/' },
  { label: 'Customers', href: '/customers' },
  { label: 'Domains', href: '/domains' },
  { label: 'Findings', href: '/findings' },
  { label: 'Reputation', href: '/reputation' },
  { label: 'Settings', href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-ocean-800 border-r border-ocean-700 min-h-screen flex flex-col">
      <div className="p-6 border-b border-ocean-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-reef-teal flex items-center justify-center text-ocean-900 font-bold text-sm">R</div>
          <div>
            <div className="font-bold text-white text-sm">ReefGuard</div>
            <div className="text-xs text-ocean-100/50">Domain Trust Monitor</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(item => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-reef-teal/20 text-reef-teal font-medium'
                  : 'text-ocean-100/70 hover:text-white hover:bg-ocean-700'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-ocean-700">
        <div className="text-xs text-ocean-100/30">GMI Security · ReefGuard v0.1</div>
      </div>
    </aside>
  );
}
