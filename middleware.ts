import { NextRequest, NextResponse } from 'next/server';
import { isUserAuthenticated } from '@/lib/auth';

export function middleware(request: NextRequest) {
  // Check if the requested path is under /dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // If user is not authenticated, redirect to login
    if (!isUserAuthenticated()) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }
  
  // Allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
};