import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, isValidSessionToken } from "./lib/auth";

function getLoginUrl(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set("next", nextPath || "/admin");
  return loginUrl;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = isValidSessionToken(sessionToken);

  const isAdminRoute = pathname.startsWith("/admin");
  const isProductosApi = pathname.startsWith("/api/productos");
  const isLoginRoute = pathname === "/login";

  if (isLoginRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if ((isAdminRoute || isProductosApi) && !isAuthenticated) {
    if (isProductosApi) {
      return NextResponse.json(
        { ok: false, error: "No autorizado. Inicia sesion para administrar productos." },
        { status: 401 }
      );
    }

    return NextResponse.redirect(getLoginUrl(request));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/productos/:path*", "/login"]
};
