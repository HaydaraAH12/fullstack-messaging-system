import { Controller } from '@nestjs/common';
import { CraeteContactService } from './craete-contact.service';

@Controller('craete-contact')
export class CraeteContactController {
  constructor(private readonly craeteContactService: CraeteContactService) {}
}
