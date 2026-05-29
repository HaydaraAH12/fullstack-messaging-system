/** User object in POST /auth/login, /auth/register, /auth/refresh JSON responses */
export interface AuthUserDto {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  phone: string | null;
  bio: string | null;
  role: string;
  roleId: string;
  isActive: boolean;
  lastSeenAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Public auth payload — refresh token is HttpOnly cookie only. */
export interface AuthResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: string;
  refresh_expires_in: string;
  user: AuthUserDto;
}

export type LoginResponse = AuthResponse;
export type RegisterResponse = AuthResponse;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}
