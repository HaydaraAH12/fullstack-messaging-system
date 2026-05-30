import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { ArchiveMessagesView } from "./archive-messages-view";

type Props = {
  params: Promise<{ locale: string }>;
};

export default function ArchivePage({ params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("archive");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <h1 className="text-xl font-semibold">{t("title")}</h1>
      <div className="mt-4 min-h-0 flex-1">
        <ArchiveMessagesView />
      </div>
    </div>
  );
}
