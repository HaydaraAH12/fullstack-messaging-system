import { UnauthorizedException } from '@nestjs/common';

export type AuthErrorCode =
  | 'SESSION_NOT_FOUND'
  | 'SESSION_EXPIRED'
  | 'SESSION_REVOKED'
  | 'REFRESH_TOKEN_REUSED'
  | 'SESSION_IDLE_TIMEOUT'
  | 'SESSION_ABSOLUTE_TIMEOUT'
  | 'REFRESH_TOKEN_MISSING';

export class AuthException extends UnauthorizedException {
  constructor(
    public readonly code: AuthErrorCode,
    message: string,
  ) {
    super({
      statusCode: 401,
      error: 'Unauthorized',
      code,
      message,
    });
  }
}
