import { disconnectMailSocket } from "@/lib/socket";
import { useAuthStore } from "@/stores/auth-store";

/** Clears access token, user, cookies, and socket — e.g. when refresh returns 401. */
export function clearLocalSession(): void {
  if (typeof window === "undefined") return;
  disconnectMailSocket();
  useAuthStore.getState().clearAuth();
}
