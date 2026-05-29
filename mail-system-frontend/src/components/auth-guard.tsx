"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { setAuthCookie } from "@/lib/auth-session";
import { getPersistedAuthSession } from "@/lib/auth-storage";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const { isAuthenticated, setAuth } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const finishHydration = () => {
      const state = useAuthStore.getState();
      const persisted = getPersistedAuthSession();
      const token = state.token ?? persisted.token;

      if (token && !state.token) {
        setAuth(token, persisted.user ?? undefined);
      } else if (token && !state.user && persisted.user) {
        setAuth(token, persisted.user);
      }

      if (token) {
        setAuthCookie(token);
      }

      setReady(true);
    };

    if (useAuthStore.persist.hasHydrated()) {
      finishHydration();
      return;
    }

    return useAuthStore.persist.onFinishHydration(finishHydration);
  }, [setAuth]);

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace("/login");
    }
  }, [ready, isAuthenticated, router]);

  if (!ready || !isAuthenticated) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">{t("checkingSession")}</p>
      </div>
    );
  }

  return children;
}
