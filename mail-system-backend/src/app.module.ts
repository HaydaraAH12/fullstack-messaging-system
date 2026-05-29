import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { JwtAuthGuard } from './auth/strategies/jwt-auth-grade';
import { ConfigModule } from '@nestjs/config';
import { DynmicQueryModule } from './dynmic-query/dynmic-query.module';
import { CraeteContactModule } from './craete-contact/craete-contact.module';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { SidebarModule } from './sidebar/sidebar.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule,
    DynmicQueryModule,
    CraeteContactModule,
    UsersModule,
    SidebarModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
