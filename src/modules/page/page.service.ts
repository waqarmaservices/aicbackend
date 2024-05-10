import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from './page.entity';

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
}
