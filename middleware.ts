import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('prottoy_session')?.value;

  // লগইন ছাড়া সরাসরি লিংক দিলে হোমে পাঠিয়ে দেবে
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const session = await verifySessionToken(token);
  if (!session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Admin রুট প্রোটেকশন
  if (pathname.startsWith('/admin') && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Student রুট প্রোটেকশন (URL-এ অন্যের ID দিলে ব্লক করবে)
  if (pathname.startsWith('/student/')) {
    const urlStudentId = pathname.split('/')[2];
    if (session.role !== 'student' || session.entityId !== urlStudentId) {
      const target = session.role === 'student' ? `/student/${session.entityId}` : '/';
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  // Faculty রুট প্রোটেকশন
  if (pathname.startsWith('/faculty/')) {
    const urlFacultyId = pathname.split('/')[2];
    if (session.role !== 'faculty' || session.entityId !== urlFacultyId) {
      const target = session.role === 'faculty' ? `/faculty/${session.entityId}` : '/';
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/student/:path*', '/faculty/:path*'],
};