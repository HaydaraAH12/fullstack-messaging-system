import { Controller, Get, Body, UseGuards, Post } from '@nestjs/common';
import { GetTableDataService } from './dynmic-query.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth-grade';
import { GetTableDataDto } from './dto/get-dynmic-query.dto';

@Controller()
export class GetTableDataController {
  constructor(private readonly service: GetTableDataService) {}

  @UseGuards(JwtAuthGuard)
  @Post('getTableData')
  async getTableData(@Body() dto: GetTableDataDto) {
    return this.service.getTableData(dto);
  }
}
