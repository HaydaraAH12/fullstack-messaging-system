import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { TrashMessagesView } from "./trash-messages-view";

type Props = {
  params: Promise<{ locale: string }>;
};

export default function TrashPage({ params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("trash");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <h1 className="text-xl font-semibold">{t("title")}</h1>
      <div className="mt-4 min-h-0 flex-1">
        <TrashMessagesView />
      </div>
    </div>
  );
}
