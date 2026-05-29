"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Archive, Star, Trash2 } from "lucide-react";
import type { MailFolderMessage, MailMessageDetails } from "@/types/mail";
import {
  archiveMessage,
  getMessageDetails,
  getMessagesByFolder,
  moveMessageToTrash,
  toggleMessageStar,
} from "@/lib/api/mail-messages";
import { useApiMutation, useApiQuery } from "@/hooks/use-api";
import { MessageDetailPanel } from "@/components/mail/message-detail-panel";
import { MessageList } from "@/components/mail/message-list";
import { Button } from "@/components/ui/button";

export function ArchiveMessagesView() {
  const t = useTranslations("mail.list");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const messagesQuery = useApiQuery<MailFolderMessage[]>({
    queryKey: ["messages", "folder", "ARCHIVE"],
    queryFn: () => getMessagesByFolder("ARCHIVE"),
  });

  const selectedMessageQuery = useApiQuery<MailMessageDetails>({
    queryKey: ["messages", "details", selectedMessageId],
    queryFn: () => getMessageDetails(selectedMessageId!),
    enabled: Boolean(selectedMessageId),
  });

  const toggleStarMutation = useApiMutation({
    mutationFn: (messageId: string) => toggleMessageStar(messageId),
    onSuccess: () => {
      void messagesQuery.refetch();
      void selectedMessageQuery.refetch();
    },
  });

  const archiveMutation = useApiMutation({
    mutationFn: (messageId: string) => archiveMessage(messageId),
    onSuccess: () => {
      void messagesQuery.refetch();
      void selectedMessageQuery.refetch();
    },
  });

  const trashMutation = useApiMutation({
    mutationFn: (messageId: string) => moveMessageToTrash(messageId),
    onSuccess: () => {
      setSelectedMessageId(null);
      void messagesQuery.refetch();
    },
  });

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

  if (messagesQuery.isPending) {
    return <p className="text-sm text-muted-foreground">{t("loading")}</p>;
  }

  if (messagesQuery.isError) {
    return <p className="text-sm text-destructive">{t("loadFailed")}</p>;
  }

  return (
    <div className="flex min-h-0 flex-1 gap-4">
      <div className="min-h-0 w-[46%] rounded-lg border border-[var(--mail-list-panel-border)] bg-[var(--mail-list-panel-bg)] p-2">
        <MessageList
          messages={messages}
          selectedMessageId={selectedMessageId}
          onSelectMessage={setSelectedMessageId}
          onToggleStar={(id) => toggleStarMutation.mutate(id)}
        />
      </div>

      <div className="min-h-0 flex-1 rounded-lg border border-[var(--mail-detail-panel-border)] bg-[var(--mail-detail-panel-bg)]">
        <div className="flex items-center gap-2 border-b p-2">
          <Button
            size="sm"
            variant="outline"
            disabled={!selectedMessageId}
            onClick={() =>
              selectedMessageId && toggleStarMutation.mutate(selectedMessageId)
            }
          >
            <Star className="size-4" />
            Star
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!selectedMessageId}
            onClick={() =>
              selectedMessageId && archiveMutation.mutate(selectedMessageId)
            }
          >
            <Archive className="size-4" />
            Archive
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={!selectedMessageId}
            onClick={() =>
              selectedMessageId && trashMutation.mutate(selectedMessageId)
            }
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
        <MessageDetailPanel
          message={selectedMessageQuery.data ?? null}
          loading={selectedMessageQuery.isPending}
        />
      </div>
    </div>
  );
}

