import { NextResponse, type NextRequest } from "next/server";

// Cookie presence-only check. We don't validate the token here — the cookie
// is set with HttpOnly by the backend on the same registrable domain
// (`localhost`), so middleware sees it. Server components on protected pages
// can still call /auth/me to do a real validity check if needed.

const PROTECTED = [/^\/cases(\/|$)/, /^\/admin(\/|$)/];
const AUTH_ROUTES = ["/sign-in", "/sign-up"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get("session")?.value);

  if (PROTECTED.some((re) => re.test(pathname)) && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  if (hasSession && AUTH_ROUTES.includes(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/cases";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/cases",
    "/cases/:path*",
    "/admin",
    "/admin/:path*",
    "/sign-in",
    "/sign-up",
  ],
};
