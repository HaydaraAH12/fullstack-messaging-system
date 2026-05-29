"use client";

import { useMemo } from "react";
import { Virtuoso } from "react-virtuoso";
import type { MailFolderMessage } from "@/types/mail";
import { MessageRow } from "@/components/mail/message-row";

type Props = {
  messages: MailFolderMessage[];
  selectedMessageId?: string | null;
  onSelectMessage?: (messageId: string) => void;
  pinnedIds?: Set<string>;
  onTogglePinned?: (messageId: string) => void;
  onMarkRead?: (messageId: string) => void;
  onToggleStar?: (messageId: string) => void;
};

export function MessageList({
  messages,
  selectedMessageId,
  onSelectMessage,
  pinnedIds,
  onTogglePinned,
  onMarkRead,
  onToggleStar,
}: Props) {
  const list = useMemo(() => {
    if (!pinnedIds?.size) return messages;
    return [...messages].sort((a, b) => {
      const ap = pinnedIds.has(a.id) ? 1 : 0;
      const bp = pinnedIds.has(b.id) ? 1 : 0;
      return bp - ap;
    });
  }, [messages, pinnedIds]);
  return (
    <div className="h-[600px]">
      <Virtuoso
        className="h-full"
        totalCount={list.length}
        overscan={400}
        itemContent={(index) => {
          const message = list[index]!;
          const isPinned = pinnedIds?.has(message.id) ?? false;
          return (
            <div className="py-1">
              <MessageRow
                message={message}
                isSelected={selectedMessageId === message.id}
                onSelect={onSelectMessage}
                isPinned={isPinned}
                onTogglePinned={onTogglePinned}
                onMarkRead={onMarkRead}
                onToggleStar={onToggleStar}
              />
            </div>
          );
        }}
      />
    </div>
  );
}
