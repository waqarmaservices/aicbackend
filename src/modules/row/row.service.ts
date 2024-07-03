
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

   createRow(payload: any): Promise<Row[]> {
    const rowData = this.rowRepository.create(payload);
    return this.rowRepository.save(rowData);
  }

  async findAll(): Promise<any> {
    return this.rowRepository.find({
  
    });
  }

  async findOne(id: number): Promise<Row> {
    return this.rowRepository.findOne({
      where: { Row: id },
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
