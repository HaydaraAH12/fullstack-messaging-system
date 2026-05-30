"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { disconnectMailSocket, getMailSocket } from "@/lib/socket";
import type { MailFolderMessage } from "@/types/mail";

const INBOX_MESSAGES_QUERY_KEY = ["messages", "folder", "INBOX"] as const;

type InboxNewEvent = {
  ok: boolean;
  data: MailFolderMessage;
};

export function MailRealtimeProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      disconnectMailSocket();
      return;
    }

    const socket = getMailSocket(token);

    const onInboxNew = (payload: InboxNewEvent) => {
      if (!payload?.ok || !payload.data?.id) return;
      const row = payload.data;

      queryClient.setQueryData<MailFolderMessage[]>(
        INBOX_MESSAGES_QUERY_KEY,
        (prev) => {
          if (!prev) return [row];
          if (prev.some((m) => m.id === row.id)) return prev;
          return [row, ...prev];
        },
      );
    };

    socket.on("inbox:new", onInboxNew);

    return () => {
      socket.off("inbox:new", onInboxNew);
    };
  }, [isAuthenticated, token, queryClient]);

  return children;
}
