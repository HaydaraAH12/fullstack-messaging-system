import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SidebarController } from './sidebar.controller';
import { SidebarService } from './sidebar.service';

@Module({
  imports: [PrismaModule],
  controllers: [SidebarController],
  providers: [SidebarService],
})
export class SidebarModule {}
