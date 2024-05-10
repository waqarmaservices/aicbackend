import { Test, TestingModule } from '@nestjs/testing';
import { RowService } from './row.service';

describe('RowService', () => {
    let service: RowService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [RowService],
        }).compile();

        service = module.get<RowService>(RowService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
