import { Test, TestingModule } from '@nestjs/testing';
import { RowController } from './row.controller';
import { RowService } from './row.service';

describe('RowController', () => {
    let controller: RowController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [RowController],
            providers: [RowService],
        }).compile();

        controller = module.get<RowController>(RowController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
