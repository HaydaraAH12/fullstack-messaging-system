import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';
import { AuthCookieService } from './auth-cookie.service';
import { JwtAuthGuard } from './strategies/jwt-auth-grade';
import type { ClientMeta } from './types/client-meta.type';

type AuthenticatedRequest = FastifyRequest & {
  user: { id: string; email: string; role: string };
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCookie: AuthCookieService,
  ) {}

  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const { response, refreshToken } = await this.authService.register(
      dto,
      this.clientMeta(req),
    );
    this.authCookie.setRefreshCookie(reply, refreshToken);
    return response;
  }

  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const { response, refreshToken } = await this.authService.login(
      dto,
      this.clientMeta(req),
    );
    this.authCookie.setRefreshCookie(reply, refreshToken);
    return response;
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const { response, refreshToken } = await this.authService.refresh(
      this.authCookie.getRefreshToken(req),
      this.clientMeta(req),
    );
    this.authCookie.setRefreshCookie(reply, refreshToken);
    return response;
  }

  @Public()
  @Post('logout')
  async logout(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    await this.authService.logout(this.authCookie.getRefreshToken(req));
    this.authCookie.clearRefreshCookie(reply);
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  async logoutAll(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    await this.authService.logoutAll(req.user.id);
    this.authCookie.clearRefreshCookie(reply);
    return { message: 'Logged out from all devices' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  listSessions(@Req() req: AuthenticatedRequest) {
    return this.authService.listSessions(req.user.id);
  }

  private clientMeta(req: FastifyRequest): ClientMeta {
    const forwarded = req.headers['x-forwarded-for'];
    const ipFromForwarded =
      typeof forwarded === 'string'
        ? forwarded.split(',')[0]?.trim()
        : undefined;
    console.log('ipFromForwarded', ipFromForwarded);
    console.log('req.ip', req.ip);
    return {
      ipAddress: ipFromForwarded ?? req.ip,
      userAgent:
        typeof req.headers['user-agent'] === 'string'
          ? req.headers['user-agent']
          : undefined,
    };
  }
}
