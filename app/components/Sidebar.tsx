'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '◉' },
  { href: '/news', label: 'Nieuws', icon: '◈' },
  { href: '/social', label: 'Social Media Posts', icon: '◎' },
  { href: '/radio', label: 'Radio Bulletins', icon: '◇' },
  { href: '/settings', label: 'Instellingen', icon: '◆' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-xl font-bold">Ibiza Nieuws</h1>
        <p className="text-gray-400 text-sm">Nieuwsverzamelaar & Content Hub</p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="text-gray-500 text-xs mt-auto pt-6">
        Ibiza & Formentera
      </div>
    </aside>
  );
}
