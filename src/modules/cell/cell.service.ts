import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cell } from './cell.entity';

@Injectable()
export class CellService {
  constructor(
    @InjectRepository(Cell)
    private readonly cellRepository: Repository<Cell>,
  ) {}

  async createCell(payload: any): Promise<Cell> {
    const cellData = this.cellRepository.create(payload as Partial<Cell>);
    return this.cellRepository.save(cellData);
  }

  async findAll(): Promise<Cell[]> {
    return this.cellRepository.find({ relations: ['Col', 'Row'] });
  }

  async findOne(id: number): Promise<Cell> {
    return this.cellRepository.findOne({ where: { Cell: id } });
  }

  async findOneByColumnName(columnName: string, value: number): Promise<Cell> {
    return this.cellRepository.findOne({
      where: { [columnName]: [value] },
    });
  }

  async getOneCell(id: number): Promise<Cell> {
    const cell = await this.cellRepository.findOne({
      where: { Cell: id },
      relations: ['Col', 'Row'],
    });
    if (!cell) {
      throw new Error('Cell not found');
    }
    return cell;
  }

  async updateCell(id: number, updateData: Partial<Cell>): Promise<Cell> {
    await this.cellRepository.update(id, updateData);
    return this.findOne(id);
  }

  async deleteCell(id: number): Promise<void> {
    await this.cellRepository.delete(id);
  }
}
