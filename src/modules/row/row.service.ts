import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Row } from './row.entity';
import * as XLSX from 'xlsx';

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
//Import Function
    async importData(filePath: string): Promise<void> {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
    
        for (const row of jsonData) {
          const rowData = this.rowRepository.create({
            PG: row['PG'],
            Share: row['Share'],
            Inherit: row['Inherit'],
            RowType: row['Row-Type'],
            RowLevel: row['Row-Level'],
            ParentRow: row['Parent-Row'],
            SiblingRow: row['Sibling-Row'],
          });
          await this.rowRepository.save(rowData);
        }
      }
}
