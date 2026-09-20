import { NextResponse } from "next/server";

import { COOKIE, verifyToken } from "@/lib/auth";

export const config = { matcher: ["/admin/:path*"] };

export async function middleware(req) {
  const { pathname, search } = req.nextUrl;

  // The login page itself must stay reachable.
  if (pathname === "/admin/login") {
    const session = await verifyToken(req.cookies.get(COOKIE)?.value);
    if (session) return NextResponse.redirect(new URL("/admin", req.url));
    return withNoIndex(NextResponse.next());
  }

  const session = await verifyToken(req.cookies.get(COOKIE)?.value);
  if (!session) {
    const url = new URL("/admin/login", req.url);
    if (pathname !== "/admin") url.searchParams.set("next", pathname + search);
    return withNoIndex(NextResponse.redirect(url));
  }

  return withNoIndex(NextResponse.next());
}

/** Belt-and-braces: robots.txt disallows /admin, this header enforces it. */
function withNoIndex(res) {
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return res;
}
