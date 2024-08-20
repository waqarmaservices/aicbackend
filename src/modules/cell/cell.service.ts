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

    async createCell(payload: any): Promise<Cell> {
        const cellData = this.cellRepository.create(payload as Partial<Cell>);
        return this.cellRepository.save(cellData);
    }

    async findAll(): Promise<Cell[]> {
        return await this.cellRepository.find({ relations: ['Col', 'Row'] });
    }

    async findOne(cellId: number): Promise<Cell> {
        return this.cellRepository.findOne({ where: { Cell: cellId } });
      }

    async findOneByColumnName(columnName: string, value: number): Promise<Cell> {
        return await this.cellRepository.findOne({
            where: { [columnName]: [value] },
        });
    }

    async getOneCell(id: number): Promise<Cell> {
        const cell = await this.cellRepository.findOne({
            where: { Cell: id },
            relations: ['CellRow', 'CellCol'],
        });
        if (!cell) {
            throw new Error('Cell not found');
        }
        return cell;
    }

    async updateCell(id: number, updateData: Partial<any>): Promise<any> {
        await this.cellRepository.update(id, updateData);
        return this.findOne(id);
    }

    async deleteCell(id: number): Promise<void> {
        await this.cellRepository.delete(id);
    }

    async findAllByColumnName(columnName: string, value: number): Promise<Cell[]> {
        return await this.cellRepository.find({
            where: { [columnName]: [value] },
        });
    }
}
