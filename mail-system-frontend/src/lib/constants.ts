/** REST: same origin (localhost:3000/api/...) — Next rewrites to :8080 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

/** WebSocket: direct to Nest (rewrite does not proxy socket.io reliably) */
export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:8080";

export const AUTH_TOKEN_KEY = "mail_auth_token";
