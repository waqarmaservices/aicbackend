import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { Tx } from './tx.entity';

@Injectable()
export class TxService {
  constructor(
    @InjectRepository(Tx)
    private txRepository: Repository<Tx>,
  ) {}


  //Import Function
  async importData(filePath: string): Promise<void> {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    for (const row of jsonData) {
      const tx = this.txRepository.create({
        TxType: row['Tx-Type'],
        TxAuditTrail: row['Tx-AuditTrail'],
        TxUser: row['Tx-User'],
        TxDateTime: row['Tx-DateTime'],
        TxXID: row['Tx-XID'],
      });
      await this.txRepository.save(tx);
    }
  }

 
}
