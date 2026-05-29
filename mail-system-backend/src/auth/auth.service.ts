import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { AuthResponse, AuthUserDto } from '@mail-system/shared';
import type { ClientMeta } from './types/client-meta.type';
import { SessionService } from './session.service';
import { AuthException } from './auth.errors';

@Injectable()
export class AuthService {
  private readonly accessExpiresInJwt: NonNullable<JwtSignOptions['expiresIn']>;
  private readonly accessExpiresInLabel: string;

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private sessionService: SessionService,
    config: ConfigService,
  ) {
    const fromEnv = config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m';
    this.accessExpiresInLabel = fromEnv;
    this.accessExpiresInJwt =
      fromEnv as NonNullable<JwtSignOptions['expiresIn']>;
  }

  async register(
    dto: RegisterDto,
    meta: ClientMeta,
  ): Promise<{ response: AuthResponse; refreshToken: string }> {
    if (!dto.password || typeof dto.password !== 'string') {
      throw new BadRequestException('Password is required');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const roleName = dto.role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER';

    const role = await this.prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          username: dto.email.split('@')[0],
          fullName: dto.fullName,
          passwordHash: hashedPassword,
          phone: dto.phone,
          avatarUrl: this.initialsFromFullName(dto.fullName),
          roleId: role.id,
        },
      });

      return await this.buildAuthResponse(user, role.name, meta);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Email already exists');
      }
      throw error;
    }
  }

  async login(
    dto: LoginDto,
    meta: ClientMeta,
  ): Promise<{ response: AuthResponse; refreshToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return await this.buildAuthResponse(user, user.role.name, meta);
  }

  async refresh(
    refreshToken: string | undefined,
    meta: ClientMeta,
  ): Promise<{ response: AuthResponse; refreshToken: string }> {
    if (!refreshToken) {
      throw new AuthException(
        'REFRESH_TOKEN_MISSING',
        'Refresh token cookie is missing',
      );
    }

    const { refreshToken: newRefreshToken, userId } =
      await this.sessionService.rotateRefreshToken(refreshToken, meta);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
    if (!user) {
      throw new AuthException('SESSION_NOT_FOUND', 'User not found for session');
    }

    const response = await this.buildAuthResponseWithoutSession(
      user,
      user.role.name,
    );
    return { response, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string | undefined): Promise<{ message: string }> {
    if (refreshToken) {
      await this.sessionService.revokeByRefreshToken(refreshToken);
    }
    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: string): Promise<{ message: string }> {
    await this.sessionService.revokeAllForUser(userId);
    return { message: 'Logged out from all devices' };
  }

  listSessions(userId: string) {
    return this.sessionService.listActiveSessionsForUser(userId);
  }

  private initialsFromFullName(fullName: string): string {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }

  private async buildAuthResponse(
    user: {
      id: string;
      email: string;
      username: string;
      fullName: string;
      avatarUrl: string | null;
      phone: string | null;
      bio: string | null;
      roleId: string;
      isActive: boolean;
      lastSeenAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
    },
    roleName: string,
    meta: ClientMeta,
  ): Promise<{ response: AuthResponse; refreshToken: string }> {
    const refreshToken = await this.sessionService.createSession(
      user.id,
      meta,
    );
    const response = await this.buildAuthResponseWithoutSession(user, roleName);
    return { response, refreshToken };
  }

  private async buildAuthResponseWithoutSession(
    user: {
      id: string;
      email: string;
      username: string;
      fullName: string;
      avatarUrl: string | null;
      phone: string | null;
      bio: string | null;
      roleId: string;
      isActive: boolean;
      lastSeenAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
    },
    roleName: string,
  ): Promise<AuthResponse> {
    const access_token = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: roleName,
      },
      { expiresIn: this.accessExpiresInJwt },
    );

    return {
      access_token,
      token_type: 'Bearer',
      expires_in: this.accessExpiresInLabel,
      refresh_expires_in: '2d',
      user: this.toAuthUserDto(user, roleName),
    };
  }

  private toAuthUserDto(
    user: {
      id: string;
      email: string;
      username: string;
      fullName: string;
      avatarUrl: string | null;
      phone: string | null;
      bio: string | null;
      roleId: string;
      isActive: boolean;
      lastSeenAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
    },
    roleName: string,
  ): AuthUserDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      bio: user.bio,
      role: roleName,
      roleId: user.roleId,
      isActive: user.isActive,
      lastSeenAt: user.lastSeenAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
