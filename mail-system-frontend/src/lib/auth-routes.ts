import { routing, type Locale } from "@/i18n/routing";

export const PUBLIC_PATHS = new Set(["/", "/login", "/register"]);

/** App routes that exist and are safe post-login redirect targets. */
export const APP_PATHS = [
  "/inbox",
  "/drafts",
  "/sent",
  "/archive",
  "/trash",
  "/profile",
  "/users",
] as const;

export type AppPath = (typeof APP_PATHS)[number];

const APP_PATHS_SET = new Set<string>(APP_PATHS);

export function isValidAppPath(path: string): path is AppPath {
  return APP_PATHS_SET.has(path);
}

/** Returns callbackUrl only when it matches a real app route; otherwise /inbox. */
export function resolvePostLoginPath(
  callbackUrl: string | null | undefined,
): AppPath {
  if (
    callbackUrl &&
    callbackUrl.startsWith("/") &&
    !callbackUrl.startsWith("//") &&
    isValidAppPath(callbackUrl)
  ) {
    return callbackUrl;
  }
  return "/inbox";
}

export function parseLocalizedPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  const hasLocale = routing.locales.includes(first as Locale);
  const locale = (hasLocale ? first : routing.defaultLocale) as Locale;
  const rest = hasLocale ? segments.slice(1) : segments;
  const pathWithoutLocale = rest.length > 0 ? `/${rest.join("/")}` : "/";

  return { locale, pathWithoutLocale };
}

export function isPublicPath(pathWithoutLocale: string) {
  return PUBLIC_PATHS.has(pathWithoutLocale);
}

export function isAuthPath(pathWithoutLocale: string) {
  return pathWithoutLocale === "/login" || pathWithoutLocale === "/register";
}
