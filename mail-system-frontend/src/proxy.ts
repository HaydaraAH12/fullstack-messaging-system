import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import {
  isAuthPath,
  isPublicPath,
  isValidAppPath,
  parseLocalizedPath,
} from "@/lib/auth-routes";
import { AUTH_TOKEN_KEY } from "@/lib/constants";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export function proxy(request: NextRequest) {
  const { locale, pathWithoutLocale } = parseLocalizedPath(
    request.nextUrl.pathname,
  );
  const rawToken = request.cookies.get(AUTH_TOKEN_KEY)?.value;
  const token = rawToken ? decodeURIComponent(rawToken) : undefined;

  if (!isPublicPath(pathWithoutLocale) && !token) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    if (isValidAppPath(pathWithoutLocale)) {
      loginUrl.searchParams.set("callbackUrl", pathWithoutLocale);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (token && isAuthPath(pathWithoutLocale)) {
    return NextResponse.redirect(new URL(`/${locale}/inbox`, request.url));
  }

  if (
    token &&
    !isPublicPath(pathWithoutLocale) &&
    !isValidAppPath(pathWithoutLocale)
  ) {
    return NextResponse.redirect(new URL(`/${locale}/inbox`, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
