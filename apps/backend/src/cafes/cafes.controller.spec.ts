import { Test, TestingModule } from '@nestjs/testing';
import { CafesController } from './cafes.controller';

describe('CafesController', () => {
  let controller: CafesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CafesController],
    }).compile();

    controller = module.get<CafesController>(CafesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
