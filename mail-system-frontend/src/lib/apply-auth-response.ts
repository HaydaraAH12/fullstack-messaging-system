import { parseExpiresInSeconds } from "@/lib/auth-token";
import { useAuthStore } from "@/stores/auth-store";
import { mapAuthUserToStore, type AuthResponse } from "@/types/auth";

export function applyAuthResponse(response: AuthResponse) {
  useAuthStore.getState().setAuth(
    response.access_token,
    mapAuthUserToStore(response.user),
    { cookieMaxAge: parseExpiresInSeconds(response.expires_in) },
  );
}
