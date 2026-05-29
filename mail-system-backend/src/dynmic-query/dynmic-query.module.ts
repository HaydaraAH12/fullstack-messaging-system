import { Module } from '@nestjs/common';
import { GetTableDataController } from './dynmic-query.controller';
import { GetTableDataService } from './dynmic-query.service';

@Module({
  controllers: [GetTableDataController],
  providers: [GetTableDataService],
})
export class DynmicQueryModule {}
