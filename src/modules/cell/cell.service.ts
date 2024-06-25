import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cell } from './cell.entity';

@Injectable()
export class CellService {
    constructor(
        @InjectRepository(Cell)
        private readonly cellRepository: Repository<Cell>,
    ) { }

    async createCell(payload: any): Promise<any> {
        const cellData = this.cellRepository.create(payload);
        return this.cellRepository.save(cellData);
    }

    async findAll(): Promise<any> {
        return this.cellRepository.find();
    }

    async findOne(id: number): Promise<Cell> {
        return this.cellRepository.findOne({ where: { Cell: id } });
    }

    async updateCell(id: number, updateData: Partial<Cell>): Promise<Cell> {
        await this.cellRepository.update(id, updateData);
        return this.findOne(id);
    }

    async deleteCell(id: number): Promise<void> {
        await this.cellRepository.delete(id);
    }
}

