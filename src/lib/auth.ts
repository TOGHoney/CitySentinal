import type { AuthUser } from "@/types/auth";

const ACCESS_KEY = "cs_access_token";
const REFRESH_KEY = "cs_refresh_token";
const SESSION_COOKIE = "cs_session";

export function decodeMockToken(token: string): { user: AuthUser; exp: number } | null {
  try {
    const encoded = token.split(".")[1] ?? token;
    const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(encoded.length / 4) * 4, "=");
    const json = new TextDecoder().decode(
      Uint8Array.from(atob(normalized), (c) => c.charCodeAt(0)),
    );
    return JSON.parse(json) as { user: AuthUser; exp: number };
  } catch {
    return null;
  }
}

function setCookie(name: string, value: string, maxAgeDays: number) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + maxAgeDays * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function clearCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setSessionTokens(accessToken: string, refreshToken: string, exp: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  setCookie(SESSION_COOKIE, accessToken, 7);
  if (exp) {
    localStorage.setItem("cs_exp", String(exp));
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem("cs_exp");
  localStorage.removeItem("cs_user");
  clearCookie(SESSION_COOKIE);
}

export function getSessionExpiry(): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("cs_exp");
  return raw ? Number(raw) : null;
}

export function isSessionExpired(): boolean {
  const exp = getSessionExpiry();
  if (!exp) return true;
  return Date.now() / 1000 > exp;
}

export function getCachedUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("cs_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function cacheUser(user: AuthUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem("cs_user", JSON.stringify(user));
}