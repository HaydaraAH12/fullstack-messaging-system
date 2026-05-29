"use client";

import { useMemo, useState } from "react";
import type { MailFolderMessage } from "@/types/mail";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserAvatar } from "@/components/user-avatar";
import {
  Paperclip,
  Pin,
  Flag,
  FlagOff,
  MailOpen,
  Mail,
} from "lucide-react";

type Props = {
  message: MailFolderMessage;
  isSelected?: boolean;
  onSelect?: (messageId: string) => void;
  isPinned?: boolean;
  onTogglePinned?: (messageId: string) => void;
  onMarkRead?: (messageId: string) => void;
  onToggleStar?: (messageId: string) => void;
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function MessageRow({
  message,
  isSelected,
  onSelect,
  isPinned,
  onTogglePinned,
  onMarkRead,
  onToggleStar,
}: Props) {
  const [hover, setHover] = useState(false);
  const preview = useMemo(() => {
    const text = message.body?.trim() ?? "";
    return text.length > 140 ? `${text.slice(0, 140)}…` : text;
  }, [message.body]);

  const sentAt = message.sentAt ?? message.createdAt;

  return (
    <div
      role="listitem"
      tabIndex={0}
      className={cn(
        "group flex w-full items-start gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors",
        "hover:bg-[var(--mail-row-hover-bg)] focus-visible:bg-[var(--mail-row-hover-bg)] focus-visible:outline-none",
        isSelected &&
          "border-[var(--mail-list-panel-border)] bg-[var(--mail-row-selected-bg)]",
        !message.isRead && "bg-[var(--mail-row-unread-bg)]",
      )}
      onClick={() => onSelect?.(message.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <UserAvatar
        user={{
          email: message.sender.username,
          fullName: message.sender.fullName,
          avatarUrl: message.sender.avatarUrl,
        }}
        className="mt-0.5"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className={cn("truncate text-sm", !message.isRead && "font-semibold")}>
                {message.sender.fullName || message.sender.username}
              </p>
              {message.attachments?.length ? (
                <Paperclip
                  className="size-4 shrink-0 text-[var(--mail-muted-text)]"
                  aria-label="Has attachments"
                />
              ) : null}
              {isPinned ? (
                <Pin
                  className="size-4 shrink-0 text-[var(--mail-muted-text)]"
                  aria-label="Pinned"
                />
              ) : null}
            </div>
            <p className={cn("truncate text-sm", !message.isRead && "font-semibold")}>
              {message.subject}
            </p>
            <p className="truncate text-xs text-[var(--mail-muted-text)]">{preview}</p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <span className="text-xs text-[var(--mail-muted-text)]">{formatTime(sentAt)}</span>

            <TooltipProvider delay={150}>
              <div
                className={cn(
                  "flex items-center gap-1",
                  hover ? "opacity-100" : "opacity-0",
                  "transition-opacity",
                )}
              >
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onTogglePinned?.(message.id)}
                        aria-label={isPinned ? "Unpin" : "Pin"}
                      >
                        <Pin className="size-3.5" />
                      </Button>
                    }
                  />
                  <TooltipContent>{isPinned ? "Unpin" : "Pin"}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => {
                          onSelect?.(message.id);
                          if (!message.isRead) onMarkRead?.(message.id);
                        }}
                        aria-label={message.isRead ? "Read" : "Mark as read"}
                        disabled={message.isRead}
                      >
                        {message.isRead ? (
                          <MailOpen className="size-3.5" />
                        ) : (
                          <Mail className="size-3.5" />
                        )}
                      </Button>
                    }
                  />
                  <TooltipContent>
                    {message.isRead ? "Read" : "Mark as read"}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onToggleStar?.(message.id)}
                        aria-label={message.isStarred ? "Unflag" : "Flag"}
                      >
                        {message.isStarred ? (
                          <Flag className="size-3.5" />
                        ) : (
                          <FlagOff className="size-3.5" />
                        )}
                      </Button>
                    }
                  />
                  <TooltipContent>
                    {message.isStarred ? "Unflag" : "Flag"}
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}

