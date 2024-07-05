import { Test, TestingModule } from '@nestjs/testing';
import { TxController } from './tx.controller';
import { TxService } from './tx.service';

describe('TxController', () => {
  let controller: TxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TxController],
      providers: [TxService],
    }).compile();

    controller = module.get<TxController>(TxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
