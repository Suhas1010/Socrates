import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("socrates_auth_token")?.value;
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/login";
  const isApi = pathname.startsWith("/api");
  const isPublicStatic =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".");

  if (isApi || isPublicStatic) {
    return NextResponse.next();
  }

  // Without a valid login/signup token, immediately redirect to /login
  if (!token && !isLoginPage) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If already authenticated and visiting /login, redirect to main page
  if (token && isLoginPage) {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
