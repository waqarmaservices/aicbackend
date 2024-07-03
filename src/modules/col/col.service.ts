import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Col } from './col.entity';

@Injectable()
export class ColService {
    constructor(
        @InjectRepository(Col)
        private readonly colRepository: Repository<Col>,
    ) {}

    /**
     * Creates a new Col.
     *
     * @returns {Promise<Col>} The newly created Col.
     */
    async createCol(): Promise<Col> {
        const colData = this.colRepository.create();
        return await this.colRepository.save(colData);
    }

    /**
     * Finds all Cols.
     *
     * @returns {Promise<Col[]>} An array of all Cols.
     */
    async findAll(): Promise<Col[]> {
        return await this.colRepository.find();
    }

    /**
     * Finds one Col based on provided Col ID.
     *
     * @param {number} id - The ID of the Col to find.
     * @returns {Promise<Col | null>} The found Col, or null if not found.
     */
    async findOne(id: number): Promise<Col | null> {
        return await this.colRepository.findOne({ where: { Col: id } });
    }

    /**
     * Updates one Col based on provided Col ID.
     *
     * @param {number} id - The ID of the Col to update.
     * @param {Partial<Col>} updateData - The data to update the Col with.
     * @returns {Promise<Col | null>} The updated Col, or null if not found.
     */
    async updateCol(id: number, updateData: Partial<Col>): Promise<Col | null> {
        await this.colRepository.update(id, updateData);
        return await this.findOne(id);
    }

    /**
     * Deletes one Col based on provided col ID
     *
     * @param {number} id - The ID of the Col to delete.
     * @returns {Promise<void>}
     */
    async deleteCol(id: number): Promise<void> {
        await this.colRepository.delete(id);
    }
}
