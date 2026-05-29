import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { LocaleSwitcher } from "@/components/locale-switcher";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default function AuthLayout({ children, params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <div className="relative flex min-h-full flex-1 items-center justify-center p-6">
      <div className="absolute end-4 top-4">
        <LocaleSwitcher />
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
