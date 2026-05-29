import { Module } from '@nestjs/common';
import { CraeteContactService } from './craete-contact.service';
import { CraeteContactController } from './craete-contact.controller';

@Module({
  controllers: [CraeteContactController],
  providers: [CraeteContactService],
})
export class CraeteContactModule {}
