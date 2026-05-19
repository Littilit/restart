import { NextResponse } from 'next/server';
import { syncAllLists } from '@/lib/lead-sync';

export async function POST() {
  try {
    const neueLeads = await syncAllLists();
    return NextResponse.json({ neueLeads });
  } catch (err) {
    console.error('[POST /api/admin/leads/sync]', err);
    return NextResponse.json({ error: 'Sync fehlgeschlagen' }, { status: 500 });
  }
}
