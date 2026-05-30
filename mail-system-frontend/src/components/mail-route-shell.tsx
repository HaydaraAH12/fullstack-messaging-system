"use client";

import { usePathname } from "@/i18n/navigation";
import { MailLayoutShell } from "@/components/mail-layout-shell";

const MAIL_PATHS = ["/inbox", "/sent", "/trash", "/archive", "/drafts"] as const;

function isMailPath(pathname: string): boolean {
  return MAIL_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/** Wraps mail folder pages with the mail sidebar + realtime provider. */
export function MailRouteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (!isMailPath(pathname)) {
    return children;
  }

  return <MailLayoutShell>{children}</MailLayoutShell>;
}
