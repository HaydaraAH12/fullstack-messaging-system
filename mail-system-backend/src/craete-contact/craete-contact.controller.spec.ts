import { Test, TestingModule } from '@nestjs/testing';
import { CraeteContactController } from './craete-contact.controller';
import { CraeteContactService } from './craete-contact.service';

describe('CraeteContactController', () => {
  let controller: CraeteContactController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CraeteContactController],
      providers: [CraeteContactService],
    }).compile();

    controller = module.get<CraeteContactController>(CraeteContactController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
