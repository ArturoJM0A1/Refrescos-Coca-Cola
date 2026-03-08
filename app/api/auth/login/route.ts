import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, createSessionToken, validateCredentials } from "@/lib/auth";

function parseRedirectPath(value: unknown) {
  const path = String(value ?? "").trim();
  return path.startsWith("/") && !path.startsWith("//") ? path : "/admin";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      username?: unknown;
      password?: unknown;
      redirect_to?: unknown;
    };

    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");

    if (!validateCredentials(username, password)) {
      return NextResponse.json(
        { ok: false, error: "Usuario o contrasena incorrectos." },
        { status: 401 }
      );
    }

    const redirectTo = parseRedirectPath(body.redirect_to);
    const response = NextResponse.json({ ok: true, redirect_to: redirectTo });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: createSessionToken(),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 10,
      path: "/"
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, error: "No fue posible iniciar sesion." },
      { status: 500 }
    );
  }
}

