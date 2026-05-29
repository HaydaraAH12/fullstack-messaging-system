import { clearAuthCookie, setAuthCookie } from "@/lib/auth-session";
import { AUTH_TOKEN_KEY } from "@/lib/constants";
import type { User } from "@/types/auth";
import type { StateStorage } from "zustand/middleware";

const PERSIST_KEY = "mail-auth";

type PersistedAuthState = {
  state?: {
    token?: string | null;
    user?: User | null;
  };
};

function syncCookieFromPersistedValue(value: string | null) {
  if (!value) {
    clearAuthCookie();
    return;
  }
  try {
    const parsed = JSON.parse(value) as PersistedAuthState;
    const token = parsed.state?.token;
    if (token) {
      setAuthCookie(token);
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      clearAuthCookie();
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch {
    clearAuthCookie();
  }
}

/** Keeps auth cookie in sync whenever Zustand persist writes (survives reload for middleware). */
export const authPersistStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(name);
  },
  setItem: (name, value) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(name, value);
    if (name === PERSIST_KEY) {
      syncCookieFromPersistedValue(value);
    }
  },
  removeItem: (name) => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(name);
    if (name === PERSIST_KEY) {
      clearAuthCookie();
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  },
};

function readPersistedAuth(): PersistedAuthState | null {
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedAuthState;
  } catch {
    return null;
  }
}

export function getPersistedAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  const direct = localStorage.getItem(AUTH_TOKEN_KEY);
  if (direct) return direct;

  return readPersistedAuth()?.state?.token ?? null;
}

export function getPersistedAuthSession(): {
  token: string | null;
  user: User | null;
} {
  if (typeof window === "undefined") {
    return { token: null, user: null };
  }

  const parsed = readPersistedAuth();
  return {
    token: parsed?.state?.token ?? localStorage.getItem(AUTH_TOKEN_KEY),
    user: parsed?.state?.user ?? null,
  };
}
