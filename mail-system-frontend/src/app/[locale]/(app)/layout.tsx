import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { MailRouteShell } from "@/components/mail-route-shell";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default function AppLayout({ children, params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <AuthGuard>
      <AppShell>
        <MailRouteShell>{children}</MailRouteShell>
      </AppShell>
    </AuthGuard>
  );
}
