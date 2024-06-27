import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from './page.entity';

@Injectable()
export class PageService {
    constructor(
        @InjectRepository(Page)
        private readonly pageRepository: Repository<Page>,
    ) {}

    async createPage(): Promise<Page> {
        const pageData = this.pageRepository.create();
        return this.pageRepository.save(pageData);
    }

    async findAll(): Promise<Page[]> {
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
}
