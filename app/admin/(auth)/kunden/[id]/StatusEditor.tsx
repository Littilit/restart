'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { CustomerStatus } from '@prisma/client';
import { STATUS_CONFIG } from '../../../StatusBadge';

const STATUS_ORDER: CustomerStatus[] = [
  'neukunde', 'startangebot', 'mitglied', 'karten_kunde', 'aggregator', 'angebot_nachfassen',
];

export default function StatusEditor({ customerId, current }: { customerId: string; current: CustomerStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function handleChange(value: string) {
    await fetch(`/api/admin/customers/${customerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: value }),
    });
    startTransition(() => router.refresh());
  }

  return (
    <select
      defaultValue={current}
      disabled={pending}
      onChange={(e) => handleChange(e.target.value)}
      className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cp-tuerkis disabled:opacity-50"
    >
      {STATUS_ORDER.map((s) => (
        <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
      ))}
    </select>
  );
}
