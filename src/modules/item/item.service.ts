import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { Item } from './item.entity';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
  ) {}


  //Import function
  async importData(filePath: string): Promise<void> {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    for (const row of jsonData) {
      const item = this.itemRepository.create({
        Cell: row['Cell'],
        Inherit: row['Inherit'],
        DataType: row['Data-Type'],
        Object: row['Object'],
        SmallInt: row['SmallInt'],
        BigInt: row['BigInt'],
        Num: row['Num'],
        Color: row['Color'],
        DateTime: row['DateTime'],
        JSON: row['JSON'],
        Qty: row['Qty'],
        Unit: row['Unit'],
        StdQty: row['Std-Qty'],
        StdUnit: row['Std-Unit'],
        Foreign: row['Foreign'],
      });
      await this.itemRepository.save(item);
    }
  }

  
}
