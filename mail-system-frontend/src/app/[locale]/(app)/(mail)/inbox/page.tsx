import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { InboxMessagesView } from "./inbox-messages-view";

type Props = {
  params: Promise<{ locale: string }>;
};

export default function InboxPage({ params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("inbox");
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <h1 className="text-xl font-semibold">{t("title")}</h1>
      {/* <p className="mt-2 text-sm text-muted-foreground">{t("description")}</p> */}

      <div className="mt-4 min-h-0 flex-1">
        <InboxMessagesView />
      </div>
    </div>
  );
}
