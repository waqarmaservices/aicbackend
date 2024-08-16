import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Format } from './format.entity';

@Injectable()
export class FormatService {
    constructor(
        @InjectRepository(Format)
        private readonly formatRepository: Repository<Format>,
    ) { }

    async createFormat(payload: any): Promise<Format> {
        const formatData = this.formatRepository.create(payload as Partial<Format>);
        return this.formatRepository.save(formatData);
    }

    async findAll(): Promise<Format[]> {
        return this.formatRepository.find({
            relations: [
                'User',
                'ObjectType',
                'PgNestedCol',
                'PgLevelSet',
                'PgSearchSet',
                'RowSetTick',
                'Owner',
                'Default',
                'Unit',
                'Deleted',
                'DeletedBy',
            ],
        });
    }

    async findOne(id: number): Promise<Format> {
        return this.formatRepository.findOne({
            where: { Format: id },
            relations: [
                'User',
                'ObjectType',
                'PgNestedCol',
                'PgLevelSet',
                'PgSearchSet',
                'RowSetTick',
                'Owner',
                'Default',
                'Unit',
                'Deleted',
                'DeletedBy',
            ],
        });
    }

    async updateFormat(id: number, updateData: Partial<Format>): Promise<Format> {
        await this.formatRepository.update(id, updateData);
        return this.findOne(id);
    }

    async deleteFormat(id: number): Promise<Format | null> {
        const format = await this.formatRepository.findOne({
            where: { Format: id },
            relations: [
                'User',
                'ObjectType',
                'PgNestedCol',
                'PgLevelSet',
                'PgSearchSet',
                'RowSetTick',
                'Owner',
                'Default',
                'Unit',
                'Deleted',
                'DeletedBy',
            ], // Include all necessary relations
        });

        if (!format) {
            return null; // Return null if the Format is not found
        }

        // Delete the format
        await this.formatRepository.delete(id);

        // Return the deleted format details
        return format;
    }


    async findAllByColumnName(colName: string, colValue: string): Promise<Format[]> {
        return this.formatRepository.find({
            where: { [colName]: colValue },
        });
    }

    async findOneByColumnName(colName: string, colValue: string): Promise<Format> {
        return this.formatRepository.findOne({
            where: { [colName]: colValue },
        });
    }

    // Delete Row record 
    async updateFormatOnRowDelete(rowId: number, userId: number): Promise<Format> {
        // Find the format entry by the rowId (stored in the Object field)
        const format = await this.formatRepository.findOne({ where: { Object: rowId } });

        if (!format) {
            throw new Error('Format not found');
        }

        // Set the Deleted field to the Row entity reference
        format.Deleted = 3000000320 as any;  // Reference to the Row entity

        // Set the DeletedBy field to the User entity reference
        format.DeletedBy = userId as any;  // Reference to the User entity

        // Set the current timestamp to DeletedAt
        format.DeletedAt = new Date();

        // Save the updated format entry
        return await this.formatRepository.save(format);
    }

    // Delete Page Record 
    async updateFormatOnpageDelete(Pg: number, userId: number): Promise<Format> {
        // Find the format entry by the page Id (stored in the Object field)
        const format = await this.formatRepository.findOne({ where: { Object: Pg } });

        if (!format) {
            throw new Error('Format not found');
        }

        // Set the Deleted field to the Row entity reference
        format.Deleted = 3000000320 as any;  // Reference to the Row entity

        // Set the DeletedBy field to the User entity reference
        format.DeletedBy = userId as any;  // Reference to the User entity

        // Set the current timestamp to DeletedAt
        format.DeletedAt = new Date();

        // Save the updated format entry
        return await this.formatRepository.save(format);
    }

    // Delete Columns Record 
    async updateFormatOnColumnsDelete(Col: number, userId: number): Promise<Format> {
        // Find the format entry by the Columns Id (stored in the Object field)
        const format = await this.formatRepository.findOne({ where: { Object: Col } });

        if (!format) {
            throw new Error('Format not found');
        }

        // Set the Deleted field to the Row entity reference
        format.Deleted = 3000000320 as any;  // Reference to the Row entity

        // Set the DeletedBy field to the User entity reference
        format.DeletedBy = userId as any;  // Reference to the User entity

        // Set the current timestamp to DeletedAt
        format.DeletedAt = new Date();

        // Save the updated format entry
        return await this.formatRepository.save(format);
    }
}
