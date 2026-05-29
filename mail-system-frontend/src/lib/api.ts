import { applyAuthResponse } from "@/lib/apply-auth-response";
import { clearLocalSession } from "@/lib/clear-local-session";
import { ApiError, type ApiErrorBody } from "@/types/api";
import type { AuthResponse } from "@/types/auth";
import { API_URL, AUTH_TOKEN_KEY } from "./constants";

type ApiFetchOptions = RequestInit & {
  token?: string | null;
  skipAuth?: boolean;
  /** Internal: prevent infinite refresh loops */
  _retry?: boolean;
};

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function parseJsonBody(text: string): unknown | null {
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const data = parseJsonBody(text);

  if (!res.ok) {
    const body = data as ApiErrorBody | null;
    const message =
      (body &&
        (Array.isArray(body.message) ? body.message.join(", ") : body.message)) ||
      text ||
      res.statusText ||
      "Request failed";
    throw new ApiError(message, res.status, body ?? undefined);
  }

  if (text && data === null) {
    throw new ApiError("Invalid response from server", res.status);
  }

  return data as T;
}

function isAuthBypassPath(path: string) {
  return (
    path.includes("/auth/login") ||
    path.includes("/auth/register") ||
    path.includes("/auth/refresh")
  );
}

let refreshPromise: Promise<void> | null = null;

async function performRefresh(): Promise<void> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok && (res.status === 401 || res.status === 403)) {
    clearLocalSession();
  }
  const data = await parseResponse<AuthResponse>(res);
  applyAuthResponse(data);
}

async function ensureRefreshedSession(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function tryRefreshSession(): Promise<boolean> {
  try {
    await ensureRefreshedSession();
    return true;
  } catch {
    return false;
  }
}

export async function api<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { token, skipAuth, headers, _retry, ...rest } = options;

  const execute = (authToken: string | null) => {
    const hasJsonBody = rest.body != null && rest.body !== "";

    return fetch(`${API_URL}${path.startsWith("/") ? path : `/${path}`}`, {
      ...rest,
      credentials: "include",
      headers: {
        ...(hasJsonBody ? { "Content-Type": "application/json" } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...headers,
      },
    });
  };

  const authToken = skipAuth ? null : (token ?? getStoredToken());
  let res = await execute(authToken);

  if (
    res.status === 401 &&
    !skipAuth &&
    !_retry &&
    !isAuthBypassPath(path) &&
    typeof window !== "undefined"
  ) {
    try {
      await ensureRefreshedSession();
      const nextToken = getStoredToken();
      res = await execute(nextToken);
    } catch {
      return parseResponse<T>(res);
    }
  }

  return parseResponse<T>(res);
}

export const apiClient = {
  get: <T>(path: string, options?: ApiFetchOptions) =>
    api<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: ApiFetchOptions) =>
    api<T>(path, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown, options?: ApiFetchOptions) =>
    api<T>(path, {
      ...options,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string, options?: ApiFetchOptions) =>
    api<T>(path, { ...options, method: "DELETE" }),
};
