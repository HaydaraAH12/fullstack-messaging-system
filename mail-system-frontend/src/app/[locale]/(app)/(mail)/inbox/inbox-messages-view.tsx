"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { MailFolderMessage, MailMessageDetails } from "@/types/mail";
import {
  getMessageDetails,
  getMessagesByFolder,
  markMessageAsRead,
  toggleMessageStar,
} from "@/lib/api/mail-messages";
import { useApiQuery, useApiMutation } from "@/hooks/use-api";
import { ComposeMailPanel } from "@/components/mail/compose-mail-panel";
import { MessageDetailPanel } from "@/components/mail/message-detail-panel";
import { MessageList } from "@/components/mail/message-list";

const PINNED_KEY = "mail:pinned:inbox";

function loadPinnedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(PINNED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x) => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function savePinnedIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PINNED_KEY, JSON.stringify(Array.from(ids)));
}

export function InboxMessagesView() {
  const t = useTranslations("mail.list");
  const pinnedIds = useMemo(() => loadPinnedIds(), []);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const showComposer = searchParams.get("compose") === "1";

  const messagesQuery = useApiQuery<MailFolderMessage[]>({
    queryKey: ["messages", "folder", "INBOX"],
    queryFn: () => getMessagesByFolder("INBOX"),
  });

  const selectedMessageQuery = useApiQuery<MailMessageDetails>({
    queryKey: ["messages", "details", selectedMessageId],
    queryFn: () => getMessageDetails(selectedMessageId!),
    enabled: Boolean(selectedMessageId),
  });

  const markReadMutation = useApiMutation({
    mutationFn: (messageId: string) => markMessageAsRead(messageId),
    onSuccess: () => {
      void messagesQuery.refetch();
    },
  });

  const toggleStarMutation = useApiMutation({
    mutationFn: (messageId: string) => toggleMessageStar(messageId),
    onSuccess: () => {
      void messagesQuery.refetch();
    },
  });

  const onTogglePinned = (id: string) => {
    const next = new Set(pinnedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    savePinnedIds(next);
    // localStorage change won't rerender this component by itself;
    // pinned is mainly a visual affordance now. We'll refresh by refetching.
    void messagesQuery.refetch();
  };
  const messages = messagesQuery.data ?? [];

  useEffect(() => {
    if (!messages.length) {
      setSelectedMessageId(null);
      return;
    }

    setSelectedMessageId((prev) =>
      prev && messages.some((m) => m.id === prev) ? prev : messages[0]!.id,
    );
  }, [messages]);

  const handleSelectMessage = (id: string) => {
    if (showComposer) {
      router.replace(pathname);
    }
    setSelectedMessageId(id);
    markReadMutation.mutate(id);
  };

  if (messagesQuery.isPending) {
    return <p className="text-sm text-[var(--mail-muted-text)]">{t("loading")}</p>;
  }

  if (messagesQuery.isError) {
    return <p className="text-sm text-destructive">{t("loadFailed")}</p>;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex min-h-0 flex-1 gap-4">
        <div className="min-h-0 w-[46%] rounded-lg border border-[var(--mail-list-panel-border)] bg-[var(--mail-list-panel-bg)] p-2">
          <MessageList
            messages={messages}
            selectedMessageId={selectedMessageId}
            onSelectMessage={handleSelectMessage}
            pinnedIds={pinnedIds}
            onTogglePinned={onTogglePinned}
            onMarkRead={(id) => markReadMutation.mutate(id)}
            onToggleStar={(id) => toggleStarMutation.mutate(id)}
          />
        </div>

        <div className="min-h-0 flex-1 rounded-lg border border-[var(--mail-detail-panel-border)] bg-[var(--mail-detail-panel-bg)]">
          {showComposer ? (
            <ComposeMailPanel
              onCancel={() => {
                router.replace(pathname);
              }}
            />
          ) : (
            <MessageDetailPanel
              message={selectedMessageQuery.data ?? null}
              loading={selectedMessageQuery.isPending}
            />
          )}
        </div>
      </div>
    </div>
  );
}
