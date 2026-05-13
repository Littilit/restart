import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminNav from '../AdminNav';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const authed = await getSession();
  if (!authed) redirect('/admin/login');

  const tagRows = await prisma.$queryRaw<{ tag: string }[]>`
    SELECT DISTINCT UNNEST(tags) AS tag FROM "Customer" ORDER BY tag
  `;
  const allTags = tagRows.map((r) => r.tag);

  return (
    <div className="min-h-screen bg-cp-grauweis flex">
      <Suspense>
        <AdminNav tags={allTags} shoreUrl={process.env.SHORE_CALENDAR_URL ?? null} />
      </Suspense>
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
