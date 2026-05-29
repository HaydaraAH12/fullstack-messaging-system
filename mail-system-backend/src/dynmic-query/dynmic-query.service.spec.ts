import { Test, TestingModule } from '@nestjs/testing';
import { DynmicQueryService } from './dynmic-query.service';

describe('DynmicQueryService', () => {
  let service: DynmicQueryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DynmicQueryService],
    }).compile();

    service = module.get<DynmicQueryService>(DynmicQueryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
