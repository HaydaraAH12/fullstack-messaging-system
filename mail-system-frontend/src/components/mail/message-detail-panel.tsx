"use client";

import { Paperclip } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { Separator } from "@/components/ui/separator";
import type { MailMessageDetails } from "@/types/mail";

type Props = {
  message: MailMessageDetails | null;
  loading?: boolean;
};

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function MessageDetailPanel({ message, loading }: Props) {
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[var(--mail-muted-text)]">
        Loading message...
      </div>
    );
  }

  if (!message) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[var(--mail-muted-text)]">
        Select a message to view details.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 p-4">
        <h2 className="text-lg font-semibold">{message.subject}</h2>
        <div className="text-xs text-[var(--mail-muted-text)]">
          {formatDateTime(message.sentAt ?? message.createdAt)}
        </div>
      </div>

      <Separator />

      <div className="min-h-0 flex-1 overflow-auto p-4">
        <div className="mb-4 flex items-start gap-3">
          <UserAvatar
            user={{
              email: message.sender.username,
              fullName: message.sender.fullName,
              avatarUrl: message.sender.avatarUrl,
            }}
          />
          <div className="min-w-0">
            <p className="text-sm font-medium">
              {message.sender.fullName || message.sender.username}
            </p>
            <p className="text-xs text-[var(--mail-muted-text)]">{message.sender.username}</p>
          </div>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-6">{message.body}</p>

        {!!message.attachments?.length && (
          <div className="mt-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--mail-muted-text)]">
              Attachments
            </p>
            <div className="space-y-1.5">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 rounded-md border px-2.5 py-2 text-sm"
                >
                  <Paperclip className="size-4 text-[var(--mail-muted-text)]" />
                  <span className="truncate">{att.filename}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!!message.replies?.length && (
          <div className="mt-6 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--mail-muted-text)]">
              Thread replies
            </p>
            {message.replies.map((reply) => (
              <div key={reply.id} className="rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">
                    {reply.sender.fullName || reply.sender.username}
                  </p>
                  <span className="text-xs text-[var(--mail-muted-text)]">
                    {formatDateTime(reply.sentAt ?? reply.createdAt)}
                  </span>
                </div>
                <p className="mb-1 text-sm font-medium">{reply.subject}</p>
                <p className="whitespace-pre-wrap text-sm text-[var(--mail-muted-text)]">
                  {reply.body}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

