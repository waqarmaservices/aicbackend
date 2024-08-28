import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Format } from './format.entity';
import { COLUMN_IDS, GENERAL, PAGE_CACHE, SYSTEM_INITIAL, TOKEN_IDS, TOKEN_NAMES } from '../../constants';

@Injectable()
export class FormatService {
  constructor(
    @InjectRepository(Format)
    private readonly formatRepository: Repository<Format>,
  ) {}

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
        'PgCols',
        'CellItems',
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

  async updateFormatByObject(Object: number, updateData: Partial<Format>) {
    await this.formatRepository.update({ Object: Object }, updateData);
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
        'PgCols',
        'CellItems',
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

  async findOneByColumnName<T extends string | number>(colName: string, colValue: T): Promise<Format> {
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
    format.Deleted = 3000000320 as any; // Reference to the Row entity

    // Set the DeletedBy field to the User entity reference
    format.DeletedBy = userId as any; // Reference to the User entity

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
    format.Deleted = 3000000320 as any; // Reference to the Row entity

    // Set the DeletedBy field to the User entity reference
    format.DeletedBy = userId as any; // Reference to the User entity

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
    format.Deleted = 3000000320 as any; // Reference to the Row entity

    // Set the DeletedBy field to the User entity reference
    format.DeletedBy = userId as any; // Reference to the User entity

    // Set the current timestamp to DeletedAt
    format.DeletedAt = new Date();

    // Save the updated format entry
    return await this.formatRepository.save(format);
  }
  async checkAndUpdateFormat(itemId: number, userId: number): Promise<Format> {
    // Get the deleted row ID using the getRowId function for the ALL_TOKENS page
    // const deletedRow = await this.getRowId(COLUMN_NAMES.TOKEN_NAMES, 'True', [PAGE_IDS.ALL_TOKENS]);
    const deletedRowId = /* deletedRow?.RowId || */ 3000000320; // Fallback to the known True ID if row retrieval fails

    // Check if a format entry exists with the given itemId in the Object field
    let format = await this.formatRepository.findOne({ where: { Object: itemId } });

    if (!format) {
      // If no match is found, create a new format entry
      format = new Format();
      format.Object = itemId;
      format.User = userId as any;
      format.ObjectType = SYSTEM_INITIAL.ROW as any; // Reference to the Row entity
      format.Deleted = deletedRowId as any; // Use the retrieved or fallback True ID
      format.DeletedBy = userId as any; // Reference to the User entity
      format.DeletedAt = new Date();
    } else {
      // Optionally, update existing format details if necessary
      format.DeletedBy = userId as any; // Reference to the User entity
      format.Deleted = deletedRowId as any; // Use the retrieved or fallback True ID
      format.DeletedAt = new Date();
    }

    // Save the format entry
    return await this.formatRepository.save(format);
  }
  // check the column id exist in format and update the format table
  async editColumnFormat(colid: number, updateData: Partial<Format>): Promise<Format> {
    // Find the format entry by the colid (stored in the Object field)
    const format = await this.formatRepository.findOne({ where: { Object: colid } });

    if (!format) {
      throw new Error('Format not found');
    }

    // Update the format entry with the provided data
    Object.assign(format, updateData);

    // Save the updated format entry
    return await this.formatRepository.save(format);
  }
  // Update Page Format
  async updatePageFormat(Pg: number, userId: number, updateFormat: Partial<Format>): Promise<Format> {
    // Find the format entry by the page Id (stored in the Object field)
    const format = await this.formatRepository.findOne({ where: { Object: Pg } });

    if (!format) {
      throw new Error('Format not found');
    }

    // Update the format fields with the new values from the DTO
    Object.assign(format, updateFormat);

    // Set the User entity reference
    format.User = userId as any;

    // Save the updated format entry
    return await this.formatRepository.save(format);
  }
}
