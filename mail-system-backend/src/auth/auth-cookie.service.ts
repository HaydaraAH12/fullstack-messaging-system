import { Injectable } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import {
  REFRESH_COOKIE_NAME,
  REFRESH_TOKEN_TTL_SEC,
} from './auth.constants';

@Injectable()
export class AuthCookieService {
  readonly cookieName = REFRESH_COOKIE_NAME;

  setRefreshCookie(reply: FastifyReply, refreshToken: string): void {
    reply.setCookie(this.cookieName, refreshToken, {
      httpOnly: true,
      secure: this.isSecureCookie(),
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_TOKEN_TTL_SEC,
    });
  }

  clearRefreshCookie(reply: FastifyReply): void {
    reply.clearCookie(this.cookieName, {
      path: '/',
      secure: this.isSecureCookie(),
      sameSite: 'lax',
    });
  }

  getRefreshToken(req: FastifyRequest): string | undefined {
    const cookies = req.cookies as Record<string, string | undefined>;
    const value = cookies[this.cookieName];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
  }

  private isSecureCookie(): boolean {
    if (process.env.COOKIE_SECURE === 'true') return true;
    if (process.env.COOKIE_SECURE === 'false') return false;
    return process.env.NODE_ENV === 'production';
  }
}
