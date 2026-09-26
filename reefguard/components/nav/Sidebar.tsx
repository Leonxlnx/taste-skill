'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { label: 'Dashboard',  href: '/',           icon: '◈' },
  { label: 'Customers',  href: '/customers',   icon: '◉' },
  { label: 'Domains',    href: '/domains',     icon: '◎' },
  { label: 'Findings',   href: '/findings',    icon: '◆' },
  { label: 'Reputation', href: '/reputation',  icon: '◐' },
  { label: 'Settings',   href: '/settings',    icon: '◌' },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 min-h-screen flex flex-col border-r border-white/[0.06] bg-[#050505] relative z-10">
      {/* Logo */}
      <div className="px-5 py-6">
        <div className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 flex-shrink-0">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-reef-teal to-reef-cyan opacity-90" />
            <div className="absolute inset-0 rounded-lg flex items-center justify-center text-[#050505] font-bold text-xs">R</div>
          </div>
          <div>
            <div className="text-[13px] font-semibold text-white tracking-tight">ReefGuard</div>
            <div className="text-[10px] text-white/30 tracking-wider uppercase">Trust Monitor</div>
          </div>
        </div>
      </div>

      {/* Nav section label */}
      <div className="px-5 mb-2">
        <span className="text-[10px] uppercase tracking-[0.15em] text-white/20 font-medium">Navigation</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5">
        {nav.map((item, i) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-300 ease-spring relative ${
                active
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/80'
              }`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {active && (
                <span className="absolute inset-0 rounded-xl bg-white/[0.06] border border-white/[0.1]" />
              )}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r-full bg-reef-teal" />
              )}
              <span className={`relative text-xs transition-colors duration-300 ${active ? 'text-reef-teal' : 'text-white/20 group-hover:text-white/40'}`}>
                {item.icon}
              </span>
              <span className="relative font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/[0.05]">
        <div className="text-[10px] text-white/15 tracking-wide">GMI Security · v0.1</div>
      </div>
    </aside>
  );
}
