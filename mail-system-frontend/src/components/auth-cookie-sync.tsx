"use client";

import { useEffect } from "react";
import { applyAuthResponse } from "@/lib/apply-auth-response";
import { tryRefreshSession } from "@/lib/api";
import { setAuthCookie } from "@/lib/auth-session";
import { clearLocalSession } from "@/lib/clear-local-session";
import { getPersistedAuthSession } from "@/lib/auth-storage";
import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth-store";

/** Syncs access token cookie; restores session via refresh cookie when needed. */
export function AuthCookieSync() {
  const router = useRouter();
  const pathname = usePathname();
  const { setAuth } = useAuth();

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const state = useAuthStore.getState();
      const persisted = getPersistedAuthSession();

      if (state.token) {
        setAuthCookie(state.token);
        if (!state.user && persisted.user) {
          setAuth(state.token, persisted.user);
        }
      } else if (persisted.token) {
        setAuth(persisted.token, persisted.user ?? undefined);
      } else {
        const refreshed = await tryRefreshSession();
        if (cancelled) return;
        if (!refreshed) {
          clearLocalSession();
          return;
        }
      }

      if (cancelled) return;

      const hasSession = Boolean(useAuthStore.getState().token);
      if (
        hasSession &&
        (pathname === "/login" || pathname === "/register")
      ) {
        router.replace("/inbox");
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [pathname, router, setAuth]);

  return null;
}
