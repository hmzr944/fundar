import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic check only: redirects visitors without a session cookie away
 * from private pages. Real authorization happens server-side on every page
 * and API route (the cookie is validated against the database there).
 */
export function proxy(request: NextRequest) {
  if (!request.cookies.has("atlas_session")) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/app/:path*"] };
