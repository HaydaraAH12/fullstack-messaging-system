import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { clearAuthCookie, setAuthCookie } from "@/lib/auth-session";
import { authPersistStorage } from "@/lib/auth-storage";
import { AUTH_TOKEN_KEY } from "@/lib/constants";
import type { User } from "@/types/auth";

interface AuthState {
  token: string | null;
  user: User | null;
  /** Pass `user` only when you intend to replace it; omit to keep the current user. */
  setAuth: (
    token: string,
    user?: User,
    options?: { cookieMaxAge?: number },
  ) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user, options) => {
        if (typeof window !== "undefined") {
          localStorage.setItem(AUTH_TOKEN_KEY, token);
          setAuthCookie(token, options?.cookieMaxAge);
        }
        set((state) => ({
          token,
          user: user !== undefined ? user : state.user,
        }));
      },
      clearAuth: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          clearAuthCookie();
        }
        set({ token: null, user: null });
      },
    }),
    {
      name: "mail-auth",
      storage: createJSONStorage(() => authPersistStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setAuthCookie(state.token);
          if (typeof window !== "undefined") {
            localStorage.setItem(AUTH_TOKEN_KEY, state.token);
          }
        }
      },
    },
  ),
);
