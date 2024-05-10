import { Test, TestingModule } from '@nestjs/testing';
import { ColService } from './col.service';

describe('ColService', () => {
    let service: ColService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ColService],
        }).compile();

        service = module.get<ColService>(ColService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
