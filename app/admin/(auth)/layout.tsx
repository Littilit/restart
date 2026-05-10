import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminNav from '../AdminNav';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const authed = await getSession();
  if (!authed) redirect('/admin/login');

  const allCustomers = await prisma.customer.findMany({ select: { tags: true } });
  const allTags = [...new Set(allCustomers.flatMap((c) => c.tags))].sort();

  return (
    <div className="min-h-screen bg-cp-grauweis flex">
      <Suspense>
        <AdminNav tags={allTags} />
      </Suspense>
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
