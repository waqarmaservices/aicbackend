import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { Format } from './format.entity';

@Injectable()
export class FormatService {
  constructor(
    @InjectRepository(Format)
    private formatRepository: Repository<Format>,
  ) {}


  //Import Function
  async importData(filePath: string): Promise<void> {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    for (const row of jsonData) {
      const format = this.formatRepository.create({
        User: row['User'],
        ObjectType: row['Object-Type'],
        Object: row['Object'],
        Container: row['Container'],
        PGNestedCol: row['PG-Nested-Col'],
        PGFreezeCol: row['PG-Freeze-Col'],
        PGExpand: row['PG-Expand'],
        PGLevelSet: row['PG-Level-Set'],
        PGSearchSet: row['PG-Search-Set'],
        PGSort: row['PG-Sort'],
        PGFilter: row['PG-Filter'],
        RowSetTick: row['RowSet-Tick'],
        ColOrder: row['Col-Order'],
        ColMinWidth: row['Col-Min-Width'],
        ItemOrder: row['Item-Order'],
        Owner: row['Owner'],
        Default: row['Default'],
        Status: row['Status'],
        Unit: row['Unit'],
        FontStyle: row['Font-Style'],
        Formula: row['Formula'],
        Comment: row['Comment'],
        TxList: row['Tx-List'],
        Deleted: row['Deleted'],
        DeletedBy: row['Deleted-By'],
        DeletedAt: row['Deleted-At'],
      });
      await this.formatRepository.save(format);
    }
  }


}
