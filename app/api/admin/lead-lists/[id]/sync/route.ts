import { NextResponse } from 'next/server';
import { syncLeadList } from '@/lib/lead-sync';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const newLeads = await syncLeadList(id);
    return NextResponse.json({ newLeads });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Sync fehlgeschlagen';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
