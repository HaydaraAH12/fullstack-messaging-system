import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default function HomePage({ params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("home");

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <div className="absolute end-4 top-4">
        <LocaleSwitcher />
      </div>
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      <nav className="flex gap-4 text-sm">
        <Link href="/login" className="font-medium underline">
          {t("login")}
        </Link>
        <Link href="/inbox" className="font-medium underline">
          {t("inbox")}
        </Link>
      </nav>
    </div>
  );
}
