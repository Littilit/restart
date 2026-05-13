'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Users, Tag, UserPlus, ClipboardList, Calendar } from 'lucide-react';

export default function AdminNav({ tags }: { tags: string[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeTag = pathname === '/admin' ? searchParams.get('tag') : null;
  const kundenActive = (pathname === '/admin' || pathname.startsWith('/admin/kunden')) && !activeTag && !pathname.startsWith('/admin/kunden/neu');
  const kundeNeuActive = pathname.startsWith('/admin/kunden/neu');
  const aufgabeActive = pathname.startsWith('/admin/aufgaben');
  const kalenderActive = pathname.startsWith('/admin/kalender');

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

      <ul className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        <li>
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              kundenActive
                ? 'bg-cp-tuerkis text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Users size={16} />
            Kunden
          </Link>
        </li>
        <li>
          <Link
            href="/admin/kunden/neu"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              kundeNeuActive
                ? 'bg-cp-tuerkis text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <UserPlus size={16} />
            Neuer Kunde
          </Link>
        </li>
        <li>
          <Link
            href="/admin/aufgaben/neu"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              aufgabeActive
                ? 'bg-cp-tuerkis text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <ClipboardList size={16} />
            Aufgabe erstellen
          </Link>
        </li>
        <li>
          <Link
            href="/admin/kalender"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              kalenderActive
                ? 'bg-cp-tuerkis text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Calendar size={16} />
            Kalender
          </Link>
        </li>

        {tags.length > 0 && (
          <li>
            <p className="px-3 pt-3 pb-1 text-xs text-white/30 uppercase tracking-wider font-semibold">
              Tags
            </p>
            <ul className="space-y-0.5">
              {tags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={`/admin?tag=${encodeURIComponent(tag)}`}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeTag === tag
                        ? 'bg-cp-tuerkis text-white'
                        : 'text-white/50 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Tag size={12} />
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        )}
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
