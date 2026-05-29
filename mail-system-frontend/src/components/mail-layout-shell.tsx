"use client";

import { useLocale } from "next-intl";
import { MailSidebar } from "@/components/mail-sidebar";
import { getDirection } from "@/components/locale-direction-sync";
import type { Locale } from "@/i18n/routing";

export function MailLayoutShell({ children }: { children: React.ReactNode }) {
  const locale = useLocale() as Locale;
  const dir = getDirection(locale);

  return (
    <div dir={dir} className="flex min-h-0 flex-1">
      <MailSidebar />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-6">
        {children}
      </main>
    </div>
  );
}
