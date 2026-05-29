import { Injectable } from '@nestjs/common';
import { Prisma, Session } from '@prisma/client';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import {
  REFRESH_TOKEN_TTL_MS,
  SESSION_ABSOLUTE_LIFETIME_MS,
  SESSION_IDLE_TIMEOUT_MS,
} from './auth.constants';
import { AuthException } from './auth.errors';
import type { ClientMeta } from './types/client-meta.type';
import { parseUserAgent } from './utils/parse-user-agent';

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async createSession(userId: string, meta: ClientMeta): Promise<string> {
    const refreshToken = randomBytes(48).toString('base64url');
    const now = new Date();
    const familyId = randomUUID();

    await this.prisma.session.create({
      data: {
        userId,
        familyId,
        tokenHash: this.hashRefreshToken(refreshToken),
        userAgent: meta.userAgent ?? null,
        ipAddress: meta.ipAddress ?? null,
        expiresAt: new Date(now.getTime() + REFRESH_TOKEN_TTL_MS),
        familyStartedAt: now,
        lastUsedAt: now,
      },
    });

    return refreshToken;
  }

  /**
   * Transaction-safe rotation with reuse detection.
   * Returns new opaque refresh token.
   */
  async rotateRefreshToken(
    refreshToken: string,
    meta: ClientMeta,
  ): Promise<{ refreshToken: string; userId: string }> {
    const tokenHash = this.hashRefreshToken(refreshToken);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const session = await tx.session.findUnique({ where: { tokenHash } });

        if (!session) {
          throw new AuthException(
            'SESSION_NOT_FOUND',
            'Refresh session not found',
          );
        }

        if (session.revokedAt) {
          await this.revokeSessionFamilyTx(tx, session.familyId);
          throw new AuthException(
            'REFRESH_TOKEN_REUSED',
            'Refresh token reuse detected. Please sign in again.',
          );
        }

        if (session.expiresAt <= new Date()) {
          await tx.session.update({
            where: { id: session.id },
            data: { revokedAt: new Date() },
          });
          throw new AuthException('SESSION_EXPIRED', 'Refresh session expired');
        }

        try {
          this.assertSessionPolicies(session);
        } catch (policyErr) {
          await tx.session.update({
            where: { id: session.id },
            data: { revokedAt: new Date() },
          });
          throw policyErr;
        }

        const now = new Date();
        await tx.session.update({
          where: { id: session.id },
          data: { revokedAt: now, lastUsedAt: now },
        });

        const newRefreshToken = randomBytes(48).toString('base64url');
        await tx.session.create({
          data: {
            userId: session.userId,
            familyId: session.familyId,
            familyStartedAt: session.familyStartedAt,
            tokenHash: this.hashRefreshToken(newRefreshToken),
            userAgent: meta.userAgent ?? session.userAgent,
            ipAddress: meta.ipAddress ?? session.ipAddress,
            expiresAt: new Date(now.getTime() + REFRESH_TOKEN_TTL_MS),
            lastUsedAt: now,
          },
        });

        return { refreshToken: newRefreshToken, userId: session.userId };
      });
    } catch (err) {
      if (err instanceof AuthException) throw err;
      throw err;
    }
  }

  async revokeByRefreshToken(refreshToken: string): Promise<void> {
    const tokenHash = this.hashRefreshToken(refreshToken);
    await this.prisma.session.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async listActiveSessionsForUser(userId: string) {
    const sessions = await this.prisma.session.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastUsedAt: 'desc' },
      select: {
        id: true,
        familyId: true,
        ipAddress: true,
        userAgent: true,
        expiresAt: true,
        lastUsedAt: true,
        familyStartedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return sessions.map((s) => {
      const device = parseUserAgent(s.userAgent ?? undefined);
      return {
        id: s.id,
        familyId: s.familyId,
        ipAddress: s.ipAddress,
        userAgent: s.userAgent,
        device,
        expiresAt: s.expiresAt,
        lastUsedAt: s.lastUsedAt,
        familyStartedAt: s.familyStartedAt,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      };
    });
  }

  private assertSessionPolicies(session: Session): void {
    const now = Date.now();

    if (
      SESSION_ABSOLUTE_LIFETIME_MS > 0 &&
      now - session.familyStartedAt.getTime() > SESSION_ABSOLUTE_LIFETIME_MS
    ) {
      throw new AuthException(
        'SESSION_ABSOLUTE_TIMEOUT',
        'Session family exceeded maximum lifetime',
      );
    }

    const lastActivity = session.lastUsedAt ?? session.createdAt;
    if (
      SESSION_IDLE_TIMEOUT_MS > 0 &&
      now - lastActivity.getTime() > SESSION_IDLE_TIMEOUT_MS
    ) {
      throw new AuthException(
        'SESSION_IDLE_TIMEOUT',
        'Session expired due to inactivity',
      );
    }
  }

  private async revokeSessionFamilyTx(
    tx: Prisma.TransactionClient,
    familyId: string,
  ): Promise<void> {
    await tx.session.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
