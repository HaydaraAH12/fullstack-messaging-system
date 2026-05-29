import { Module } from '@nestjs/common';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthCookieService } from './auth-cookie.service';
import { SessionService } from './session.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const accessExpiresIn =
          config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m';
        return {
          secret: config.get<string>('JWT_SECRET')!,
          signOptions: {
            expiresIn: accessExpiresIn as JwtModuleOptions['signOptions'] extends {
              expiresIn?: infer T;
            }
              ? T
              : never,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionService, AuthCookieService, JwtStrategy],
  exports: [JwtModule],
})
export class AuthModule {}
