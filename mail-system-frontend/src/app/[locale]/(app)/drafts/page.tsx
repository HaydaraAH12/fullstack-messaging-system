import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";

type Props = {
  params: Promise<{ locale: string }>;
};

export default function DraftsPage({ params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("mail");

  return (
    <div>
      <h1 className="text-xl font-semibold">{t("drafts")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("draftsDescription")}
      </p>
    </div>
  );
}
