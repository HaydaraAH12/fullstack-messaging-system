import { Body, Controller, Get, Param, Patch, Request, UseGuards } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth-grade';
import { MoveSidebarItemDto } from './dto/move-sidebar-item.dto';
import { SidebarService } from './sidebar.service';

type AuthenticatedRequest = ExpressRequest & {
  user: {
    id: string;
  };
};

@UseGuards(JwtAuthGuard)
@Controller('messages/sidebar')
export class SidebarController {
  constructor(private readonly sidebarService: SidebarService) {}

  @Get()
  getSidebar(@Request() req: AuthenticatedRequest) {
    return this.sidebarService.getSidebar(req.user.id);
  }

  @Patch(':id/position')
  moveItem(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: MoveSidebarItemDto,
  ) {
    return this.sidebarService.moveItem(req.user.id, id, dto.direction);
  }
}
