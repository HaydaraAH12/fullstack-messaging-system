"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";
import type { Locale } from "@/i18n/routing";

export function getDirection(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

/** Keeps <html lang/dir> in sync when the locale changes via client navigation. */
export function LocaleDirectionSync() {
  const locale = useLocale() as Locale;
  const dir = getDirection(locale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  return null;
}
