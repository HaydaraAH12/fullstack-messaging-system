"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { useApiQuery } from "@/hooks/use-api";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchMailSidebar,
  mailSidebarQueryKey,
} from "@/lib/api/mail-sidebar";
import type { MailSidebarResponse } from "@/types/mail";

const SIDEBAR_FAILED_KEY = "mail:sidebar:failed";

function isSidebarFetchBlocked(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SIDEBAR_FAILED_KEY) === "1";
}

function blockSidebarFetch(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SIDEBAR_FAILED_KEY, "1");
}

export function clearSidebarFetchBlock(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SIDEBAR_FAILED_KEY);
}

/**
 * Sidebar fetch runs once per session until it succeeds.
 * After a hard failure (4xx/5xx/network), it will not call the API again
 * until the user clicks retry — independent of folder/message queries.
 */
export function useMailSidebarQuery() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [blocked, setBlocked] = useState(isSidebarFetchBlocked);

  // If a previous session set the "failed" flag, we still want a fresh fetch
  // right after a user authenticates.
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!blocked && !isSidebarFetchBlocked()) return;

    clearSidebarFetchBlock();
    setBlocked(false);
    queryClient.removeQueries({ queryKey: mailSidebarQueryKey });
  }, [isAuthenticated, blocked, queryClient]);

  const query = useApiQuery<MailSidebarResponse>({
    queryKey: mailSidebarQueryKey,
    queryFn: fetchMailSidebar,
    requireAuth: true,
    enabled: isAuthenticated && !blocked,
    retry: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!query.isError) return;
    blockSidebarFetch();
    setBlocked(true);
  }, [query.isError]);

  const retry = useCallback(async () => {
    clearSidebarFetchBlock();
    setBlocked(false);
    await queryClient.fetchQuery({
      queryKey: mailSidebarQueryKey,
      queryFn: fetchMailSidebar,
    });
  }, [queryClient]);

  const failed = blocked || query.isError;

  return { ...query, retry, isBlocked: blocked, failed };
}
