import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { MailLayoutShell } from "@/components/mail-layout-shell";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default function MailLayout({ children, params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return <MailLayoutShell>{children}</MailLayoutShell>;
}
