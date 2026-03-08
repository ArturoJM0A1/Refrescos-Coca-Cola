import type { NextRequest } from "next/server";

export const AUTH_COOKIE_NAME = "refresco_admin_session";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin";
const ADMIN_SESSION_TOKEN = "refresco_admin_auth_v1";

export function validateCredentials(username: string, password: string) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function createSessionToken() {
  return ADMIN_SESSION_TOKEN;
}

export function isValidSessionToken(token: string | undefined) {
  return token === ADMIN_SESSION_TOKEN;
}

export function isAuthorizedRequest(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  return isValidSessionToken(token);
}
