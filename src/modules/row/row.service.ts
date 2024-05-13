import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Row } from './row.entity';

@Injectable()
export class RowService {
    constructor(
        @InjectRepository(Row)
        private rowRepository: Repository<Row>,
    ) {}

    createRow(payload: any) {
        console.log('payload', payload);
        const pageData = this.rowRepository.create(payload);
        return this.rowRepository.save(pageData);
    }
}
