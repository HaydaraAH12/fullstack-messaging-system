/** Refresh token cookie + session TTL (1 days) */
export const REFRESH_TOKEN_TTL_MS = 1 * 24 * 60 * 60 * 1000;
export const REFRESH_TOKEN_TTL_SEC = Math.floor(REFRESH_TOKEN_TTL_MS / 1000);

export const REFRESH_COOKIE_NAME =
  process.env.REFRESH_TOKEN_COOKIE_NAME ?? 'refresh_token';

/** Optional: max lifetime of a refresh family (default 30 days). 0 = disabled */
export const SESSION_ABSOLUTE_LIFETIME_MS = Number(
  process.env.SESSION_ABSOLUTE_LIFETIME_MS ?? 30 * 24 * 60 * 60 * 1000,
);

/** Optional: idle timeout since last_used_at (default 7 days). 0 = disabled */
export const SESSION_IDLE_TIMEOUT_MS = Number(
  process.env.SESSION_IDLE_TIMEOUT_MS ?? 7 * 24 * 60 * 60 * 1000,
);
