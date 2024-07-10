import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Format } from './format.entity';

@Injectable()
export class FormatService {
  constructor(
    @InjectRepository(Format)
    private readonly formatRepository: Repository<Format>,
  ) {}

  async createFormat(payload: any): Promise<Format> {
    const formatData = this.formatRepository.create(payload as Partial<Format>);
    return this.formatRepository.save(formatData);
  }

  async findAll(): Promise<Format[]> {
    return this.formatRepository.find({
      relations: [
        'User',
        'ObjectType',
        'PgNestedCol',
        'PgLevelSet',
        'PgSearchSet',
        'RowSetTick',
        'Owner',
        'Default',
        'Unit',
        'Deleted',
        'DeletedBy',
      ],
    });
  }

  async findOne(id: number): Promise<Format> {
    return this.formatRepository.findOne({
      where: { Format: id },
      relations: [
        'User',
        'ObjectType',
        'PgNestedCol',
        'PgLevelSet',
        'PgSearchSet',
        'RowSetTick',
        'Owner',
        'Default',
        'Unit',
        'Deleted',
        'DeletedBy',
      ],
    });
  }

  async updateFormat(id: number, updateData: Partial<Format>): Promise<Format> {
    await this.formatRepository.update(id, updateData);
    return this.findOne(id);
  }

  async deleteFormat(id: number): Promise<void> {
    await this.formatRepository.delete(id);
  }

  async findAllByColumnName(colName: string, colValue: string): Promise<Format[]> {
    return this.formatRepository.find({
      where: { [colName]: colValue },
    });
  }
}
