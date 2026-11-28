import { NextResponse, type NextRequest } from "next/server";

/**
 * The API is authorised with a Bearer token, never cookies. Browsers send every cookie set on the
 * site's host (on localhost that includes other apps), and big cookies make nginx answer
 * "400 Request Header Or Cookie Too Large". So cookies are dropped before /api/v1 is proxied.
 */
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.delete("cookie");
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: "/api/v1/:path*" };
