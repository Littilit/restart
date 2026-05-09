import { NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';
import { timingSafeEqual } from 'crypto';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Ungültiger Request-Body' }, { status: 400 });
  }

  const { password } = body as { password?: string };
  if (!password) {
    return NextResponse.json({ error: 'Passwort fehlt' }, { status: 400 });
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    console.error('[admin/login] ADMIN_PASSWORD nicht gesetzt');
    return NextResponse.json({ error: 'Server-Konfigurationsfehler' }, { status: 500 });
  }

  const enc = new TextEncoder();
  const a = enc.encode(password.padEnd(expected.length));
  const b = enc.encode(expected.padEnd(password.length));
  const match =
    password.length === expected.length && timingSafeEqual(a, b);

  if (!match) {
    return NextResponse.json({ error: 'Falsches Passwort' }, { status: 401 });
  }

  await createSession();
  return NextResponse.json({ ok: true });
}
