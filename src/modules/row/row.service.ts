
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Row } from './row.entity'; 

@Injectable()
export class RowService {
  constructor(
    @InjectRepository(Row)
    private readonly rowRepository: Repository<Row>,
  ) {}

   createRow(payload: any): Promise<any> {
    const rowData = this.rowRepository.create(payload);
    return this.rowRepository.save(rowData);
  }

  async findAll(): Promise<any> {
    return this.rowRepository.find({
      relations: ['PG', 'Share', 'ParentRow', 'SiblingRow'],
    });
  }

  async findOne(id: number): Promise<Row> {
    return this.rowRepository.findOne({
      where: { Row: id },
      relations: ['PG', 'Share', 'ParentRow', 'SiblingRow'],
    });
  }

  async updateRow(id: number, updateData: Partial<Row>): Promise<Row> {
    await this.rowRepository.update(id, updateData);
    return this.findOne(id);
  }

  async deleteRow(id: number): Promise<void> {
    await this.rowRepository.delete(id);
  }
}
