import { Test, TestingModule } from '@nestjs/testing';
import { FormatController } from './format.controller';
import { FormatService } from './format.service';

describe('FormatController', () => {
    let controller: FormatController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FormatController],
            providers: [FormatService],
        }).compile();

        controller = module.get<FormatController>(FormatController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
