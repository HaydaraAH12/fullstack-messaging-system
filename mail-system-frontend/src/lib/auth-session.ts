import { AUTH_TOKEN_KEY } from "@/lib/constants";

const DEFAULT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function setAuthCookie(
  token: string,
  maxAgeSeconds: number = DEFAULT_COOKIE_MAX_AGE,
) {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

export function clearAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
}

export function getAuthCookieToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${AUTH_TOKEN_KEY}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}
