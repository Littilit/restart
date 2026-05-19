'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LeadAutoSync() {
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/leads/sync', { method: 'POST' })
      .then((r) => r.json())
      .then((data) => {
        if (data.neueLeads > 0) router.refresh();
      })
      .catch(() => {});
  }, [router]);

  return null;
}
