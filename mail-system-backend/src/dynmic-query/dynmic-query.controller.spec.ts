import { Test, TestingModule } from '@nestjs/testing';
import { DynmicQueryController } from './dynmic-query.controller';
import { DynmicQueryService } from './dynmic-query.service';

describe('DynmicQueryController', () => {
  let controller: DynmicQueryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DynmicQueryController],
      providers: [DynmicQueryService],
    }).compile();

    controller = module.get<DynmicQueryController>(DynmicQueryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
