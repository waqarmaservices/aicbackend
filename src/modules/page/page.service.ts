import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from './page.entity';

@Injectable()
export class PageService {
    constructor(
        @InjectRepository(Page)
        private readonly pageRepository: Repository<Page>,
    ) { }

    async createPage(): Promise<Page> {
        const pageData = this.pageRepository.create();
        return this.pageRepository.save(pageData);
    }

    async findAll(): Promise<any> {
        return this.pageRepository.find();
    }

    async findOne(id: number): Promise<Page> {
        return this.pageRepository.findOne({ where: { PG: id } });
    }

    async updatePage(id: number, updateData: Partial<Page>): Promise<Page> {
        await this.pageRepository.update(id, updateData);
        return this.findOne(id);
    }

    async deletePage(id: number): Promise<void> {
        await this.pageRepository.delete(id);
    }

    async getOnePage(pageId: number): Promise<any> {
        const page = await this.pageRepository.findOne({
            where: { PG: pageId },
            relations: ['rows', 'rows.cells', 'rows.cells.Col', 'rows.cells.items']
        });
        if (!page) {
            throw new Error('Page not found');
        }
        return page;
    }
    async getAllPagesData(): Promise<Page[]> {
        try {
            const allPagesData = await this.pageRepository.find({ relations: ['rows', 'rows.cells', 'rows.cells.Col', 'rows.cells.items'] });
            return allPagesData;
        } catch (error) {
            throw error;
        }
    }
}
