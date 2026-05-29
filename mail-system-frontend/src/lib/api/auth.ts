import { apiClient } from "@/lib/api";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "@/types/auth";

export function login(body: LoginRequest) {
  return apiClient.post<AuthResponse>("/auth/login", body, { skipAuth: true });
}

export function register(body: RegisterRequest) {
  return apiClient.post<AuthResponse>("/auth/register", body, {
    skipAuth: true,
  });
}

export function refreshSession() {
  return apiClient.post<AuthResponse>("/auth/refresh", undefined, {
    skipAuth: true,
  });
}

export function logoutSession() {
  return apiClient.post<{ message: string }>("/auth/logout", undefined, {
    skipAuth: true,
  });
}
