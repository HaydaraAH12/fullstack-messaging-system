"use client";

import { useLocale } from "next-intl";
import { AppSidebar } from "@/components/app-sidebar";
import { HeaderUser } from "@/components/header-user";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { MailTopRibbon } from "@/components/mail/mail-top-ribbon";
import { getDirection } from "@/components/locale-direction-sync";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export function AppShell({ children }: { children: React.ReactNode }) {
  const locale = useLocale() as Locale;
  const dir = getDirection(locale);
  const pathname = usePathname();
  const isMailRoute = ["/inbox", "/sent", "/trash", "/archive", "/drafts"].some(
    (p) => pathname.startsWith(p),
  );

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={false} className="min-h-svh" dir={dir}>
        <AppSidebar />
        <SidebarInset dir={dir}>
          <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b px-4">
            <SidebarTrigger className="-ms-1" />
            <div className="flex items-center gap-3">
              <HeaderUser />
              <LocaleSwitcher />
            </div>
          </header>
          {isMailRoute ? <MailTopRibbon /> : null}
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
