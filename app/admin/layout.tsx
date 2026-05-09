import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import AdminNav from './AdminNav';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const authed = await getSession();
  if (!authed) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-cp-grauweis flex">
      <AdminNav />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
