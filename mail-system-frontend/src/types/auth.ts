import type { AuthUserDto } from "@mail-system/shared";

export type {
  AuthResponse,
  AuthUserDto,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "@mail-system/shared";

/** Slim user shape for client state / UI */
export interface User {
  id: string;
  email: string;
  username?: string;
  fullName?: string;
  avatarUrl?: string | null;
  role?: string;
  isActive?: boolean;
}

export function mapAuthUserToStore(user: AuthUserDto): User {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    isActive: user.isActive,
  };
}
