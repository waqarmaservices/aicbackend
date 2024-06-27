import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Col } from './col.entity';

@Injectable()
export class ColService {
    constructor(
        @InjectRepository(Col)
        private readonly colRepository: Repository<Col>,
    ) {}

    async createCol(): Promise<Col> {
        const colData = this.colRepository.create();
        return this.colRepository.save(colData);
    }

    async findAll(): Promise<Col[]> {
        return this.colRepository.find();
    }

    async findOne(id: number): Promise<Col> {
        return this.colRepository.findOne({ where: { Col: id } });
    }

    async updateCol(id: number, updateData: Partial<Col>): Promise<Col> {
        await this.colRepository.update(id, updateData);
        return this.findOne(id);
    }

    async deleteCol(id: number): Promise<void> {
        await this.colRepository.delete(id);
    }
}
