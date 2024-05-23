import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from './page.entity';
import * as XLSX from 'xlsx';

@Injectable()
export class PageService {
   
    constructor(
        @InjectRepository(Page)
        private pageRepository: Repository<Page>,
    ) {}

    findAll(): Promise<Page[]> {
        return this.pageRepository.find();
    }

    createPage() {
        const pageData = this.pageRepository.create();
        return this.pageRepository.save(pageData);
    }

    //Import function 

    async importData(filePath: string): Promise<void> {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
    
        for (const row of jsonData) {
          const pg = this.pageRepository.create({});
          await this.pageRepository.save(pg);
        }
      }
}
