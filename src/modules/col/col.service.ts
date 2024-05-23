import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { Col } from './col.entity';

@Injectable()
export class ColService {
  constructor(
    @InjectRepository(Col)
    private colRepository: Repository<Col>,
  ) {}

//Import function

  async importData(filePath: string): Promise<void> {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    for (const row of jsonData) {
      const col = this.colRepository.create({});
      await this.colRepository.save(col);
    }
  }

}
