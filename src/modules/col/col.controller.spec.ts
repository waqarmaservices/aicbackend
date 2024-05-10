import { Test, TestingModule } from '@nestjs/testing';
import { ColController } from './col.controller';
import { ColService } from './col.service';

describe('ColController', () => {
    let controller: ColController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ColController],
            providers: [ColService],
        }).compile();

        controller = module.get<ColController>(ColController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
