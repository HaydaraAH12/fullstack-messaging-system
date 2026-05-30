import { ApiError } from "@/types/api";

/** Stop retrying when the server responded with 4xx/5xx. */
export function noRetryOnHttpError(
  failureCount: number,
  error: unknown,
): boolean {
  if (error instanceof ApiError && error.status >= 400) {
    return false;
  }
  return failureCount < 2;
}
