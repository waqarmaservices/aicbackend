import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import { Cell } from './cell.entity';

@Injectable()
export class CellService {
  constructor(
    @InjectRepository(Cell)
    private cellRepository: Repository<Cell>,
  ) {}

  //Import function 
  async importData(filePath: string): Promise<void> {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);
    console.log('jsonData', jsonData);

    for (const row of jsonData) {
      const cell = this.cellRepository.create({
        Col: row['Col'],
        Row: row['Row'],
        DataType: row['Data-Type'],
        DropDownSource: row['DropDown-Source'],
        Items: row['Items'],
      });
      await this.cellRepository.save(cell);
    }
  }

  
}
