'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Users } from 'lucide-react';

const links = [
  { href: '/admin', label: 'Kunden', icon: Users },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  return (
    <nav className="w-56 bg-cp-blau flex flex-col shrink-0">
      <div className="px-5 py-6 border-b border-white/10">
        <Image src="/logo.svg" alt="Cryopoint" width={120} height={32} className="brightness-0 invert" />
        <p className="text-xs text-white/40 mt-1 font-medium tracking-wide uppercase">CRM</p>
      </div>

      <ul className="flex-1 py-4 px-2 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-cp-tuerkis text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="px-2 pb-4">
        <button
          onClick={logout}
          className="w-full px-3 py-2 text-sm text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
        >
          Abmelden
        </button>
      </div>
    </nav>
  );
}
