"use client";

import { useCallback, useEffect } from "react";
import { logoutSession } from "@/lib/api/auth";
import { getPersistedAuthSession } from "@/lib/auth-storage";
import { disconnectMailSocket } from "@/lib/socket";
import { useAuthStore } from "@/stores/auth-store";

export function useAuth() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    if (token || typeof window === "undefined") return;
    const persisted = getPersistedAuthSession();
    if (persisted.token) {
      setAuth(persisted.token, persisted.user ?? undefined);
    }
  }, [token, setAuth]);

  const isAuthenticated = Boolean(token);

  const logout = useCallback(async () => {
    try {
      await logoutSession();
    } catch {
      // Still clear local session if server logout fails
    }
    disconnectMailSocket();
    clearAuth();
  }, [clearAuth]);

  return {
    token,
    user,
    isAuthenticated,
    setAuth,
    logout,
  };
}
