import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthModule } from '../auth/auth.module';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { AttachmentsService } from './attachments.service';
import { MessagesGateway } from './messages.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    MailModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [MessagesController],
  providers: [MessagesService, AttachmentsService, MessagesGateway],
  exports: [MessagesService],
})
export class MessagesModule {}
