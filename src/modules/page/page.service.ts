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

    /**
     * Creates a new PG.
     *
     * @returns {Promise<Page>} The newly created PG.
     */
    async createPage(): Promise<Page> {
        const pageData = this.pageRepository.create();
        return await this.pageRepository.save(pageData);
    }

    /**
     * Finds all PGs.
     *
     * @returns {Promise<Page[]>} An array of all PGs.
     */
    async findAll(): Promise<Page[]> {
        return await this.pageRepository.find();
    }

    /**
     * Finds one PG based on provided PG ID.
     *
     * @param {number} id - The ID of the PG to find.
     * @returns {Promise<Page | null>} The found PG, or null if not found.
     */
    async findOne(id: number): Promise<Page | null> {
        return await this.pageRepository.findOne({ where: { PG: id } });
    }

    /**
     * Updates one PG based on provided PG ID.
     *
     * @param {number} id - The ID of the PG to update.
     * @param {Partial<Page>} updateData - The data to update the PG with.
     * @returns {Promise<Page | null>} The updated PG, or null if not found.
     */
    async updatePage(
        id: number,
        updateData: Partial<Page>,
    ): Promise<Page | null> {
        await this.pageRepository.update(id, updateData);
        return await this.findOne(id);
    }

    /**
     * Deletes one PG based on provided PG ID.
     *
     * @param {number} id - The ID of the PG to delete.
     * @returns {Promise<void>}
     */
    async deletePage(id: number): Promise<void> {
        await this.pageRepository.delete(id);
    }
}
