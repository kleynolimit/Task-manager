import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for API key on API routes (for bot access)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const apiKey = request.headers.get('x-api-key');
    const expectedKey = process.env.API_SECRET_KEY;

    // Allow access if valid API key is present
    if (apiKey && expectedKey && apiKey === expectedKey) {
      return NextResponse.next();
    }

    // For /api/auth routes, allow without API key (NextAuth handles this)
    if (request.nextUrl.pathname.startsWith('/api/auth/')) {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
