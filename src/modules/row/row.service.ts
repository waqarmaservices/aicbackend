// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Row } from './row.entity';
// import * as XLSX from 'xlsx';

// @Injectable()
// export class RowService {
//     constructor(
//         @InjectRepository(Row)
//         private rowRepository: Repository<Row>,
//     ) { }

//     createRow(payload: any) {
//         console.log('payload', payload);
//         const pageData = this.rowRepository.create(payload);
//         return this.rowRepository.save(pageData);
//     }


//     findAll(): Promise<Row[]> {
//         return this.rowRepository.find();
//     }






//     //Import Function
//     // async importData(filePath: string): Promise<void> {
//     //     const workbook = XLSX.readFile(filePath);
//     //     const sheetName = workbook.SheetNames[0];
//     //     const sheet = workbook.Sheets[sheetName];
//     //     const jsonData = XLSX.utils.sheet_to_json(sheet);

//     //     for (const row of jsonData) {
//     //       const rowData = this.rowRepository.create({
//     //         PG: row['PG'],
//     //         Share: row['Share'],
//     //         Inherit: row['Inherit'],
//     //         RowType: row['Row-Type'],
//     //         RowLevel: row['Row-Level'],
//     //         ParentRow: row['Parent-Row'],
//     //         SiblingRow: row['Sibling-Row'],
//     //       });
//     //       await this.rowRepository.save(rowData);
//     //     }
//     //   }
// }


import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Row } from './row.entity';  // Ensure this matches your structure

@Injectable()
export class RowService {
  constructor(
    @InjectRepository(Row)
    private readonly rowRepository: Repository<Row>,
  ) {}

   createRow(payload: any): Promise<Row> {
    const rowData = this.rowRepository.create(payload as Partial<Row>);
    return this.rowRepository.save(rowData);
  }

  async findAll(): Promise<Row[]> {
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
