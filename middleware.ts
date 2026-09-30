import { NextResponse, type NextRequest } from "next/server";
import { SESSION_CONFIG } from "./src/lib/auth";

const SESSION_COOKIE = SESSION_CONFIG.cookieName;

/**
 * Middleware for protecting authenticated routes
 * 
 * Note: For performance reasons, this middleware only checks for the presence of the session cookie.
 * Full session validation (checking database, expiration, user status) is done in the API routes
 * and in the /api/auth/me endpoint which is called by the frontend.
 * 
 * SEC-002: The actual session validation happens in the API layer where we have database access.
 */

/**
 * Add security headers to all responses - SEC-021, SEC-022
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Basic security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  
  // Content Security Policy - SEC-022
  // Note: Adjust based on your actual CDN and service providers
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://fonts.googleapis.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; " +
    "img-src 'self' data: blob: https://*.googleusercontent.com https://cdn.jsdelivr.net; " +
    "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; " +
    "connect-src 'self' ws: wss: https://cdn.jsdelivr.net; " +
    "frame-src 'none'; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "frame-ancestors 'none'"
  );
  
  return response;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Add security headers to all responses
  const response = NextResponse.next();
  addSecurityHeaders(response);
  
  // For protected routes, check authentication
  if (pathname.startsWith('/admin') || pathname.startsWith('/member')) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    
    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      const redirectResponse = NextResponse.redirect(loginUrl);
      addSecurityHeaders(redirectResponse);
      return redirectResponse;
    }

    // Token exists, allow access (full validation happens in API routes)
    return response;
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-*.js).*)"],
};
