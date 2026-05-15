import { NextResponse, type NextRequest } from 'next/server';
import { getSessionFromToken } from '@/lib/auth';

const PROTECTED = ['/admin', '/api/admin'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  if (pathname === '/admin/login' || pathname === '/api/admin/login') return NextResponse.next();

  const token = request.cookies.get('admin_session')?.value;
  const valid = await getSessionFromToken(token);

  if (!valid) {
    if (pathname.startsWith('/api/admin')) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
