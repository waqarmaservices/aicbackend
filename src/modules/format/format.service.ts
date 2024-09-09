import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Format } from './format.entity';
import { CellService } from 'modules/cell/cell.service';
import { RowService } from 'modules/row/row.service';
import { ColService } from 'modules/col/col.service';
import { PageService } from 'modules/page/page.service';

@Injectable()
export class FormatService {
  constructor(
    @InjectRepository(Format)
    private readonly formatRepository: Repository<Format>,
    @Inject(forwardRef(() => PageService))
    private readonly pageService: PageService,
    private readonly colService: ColService,
    private readonly rowService: RowService,
    @Inject(forwardRef(() => CellService))
    private readonly cellService: CellService,
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
        'Object',
        'Container',
        'PgCols',
        'PgNestedCol',
        'PgFreezeCol',
        'PgExpand',
        'PgLevelSet',
        'PgSearchSet',
        'PgSort',
        'PgFilter',
        'CellItems',
        'ColMinWidth',
        'RowSetTick',
        'Owner',
        'Status',
        'Default',
        'FontStyle',
        'Formula',
        'Comment',
        'TxList',
        'Unit',
        'Recycled',
        'RecycledBy',
        'RecycledAt'
      ],
    });
  }

  async findOne(id: number): Promise<Format> {
    return this.formatRepository.findOne({
      where: { Format: id },
      relations: [
        'User',
        'ObjectType',
        'Object',
        'Container',
        'PgCols',
        'PgNestedCol',
        'PgFreezeCol',
        'PgExpand',
        'PgLevelSet',
        'PgSearchSet',
        'PgSort',
        'PgFilter',
        'CellItems',
        'ColMinWidth',
        'RowSetTick',
        'Owner',
        'Status',
        'Default',
        'FontStyle',
        'Formula',
        'Comment',
        'TxList',
        'Unit',
        'Recycled',
        'RecycledBy',
        'RecycledAt'
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
    });

    if (!format) {
      return null; // Return null if the Format is not found
    }

    // Delete the format
    await this.formatRepository.delete(id);

    // Return the Recycled format details
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

      // Set the Recycled field to the Row entity reference
      format.Recycled = 3000000248 as any; // Reference to the Row entity

      // Set the RecycledBy field to the User entity reference
      format.RecycledBy = userId as any; // Reference to the User entity

      // Set the current timestamp to RecycledAt
      format.RecycledAt = new Date();

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

    // Set the Recycled field to the Row entity reference
    format.Recycled = 3000000248 as any; // Reference to the Row entity

    // Set the RecycledBy field to the User entity reference
    format.RecycledBy = userId as any; // Reference to the User entity

    // Set the current timestamp to RecycledAt
    format.RecycledAt = new Date();

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

    // Set the Recycled field to the Row entity reference
    format.Recycled = 3000000248 as any; // Reference to the Row entity

    // Set the RecycledBy field to the User entity reference
    format.RecycledBy = userId as any; // Reference to the User entity

    // Set the current timestamp to RecycledAt
    format.RecycledAt = new Date();

    // Save the updated format entry
    return await this.formatRepository.save(format);
  }
  async checkAndUpdateFormat(itemId: number, userId: number): Promise<Format> {
    // Get the Recycled row ID using the getRowId function for the ALL_TOKENS page
    // const RecycledRow = await this.getRowId(COLUMN_NAMES.TOKEN_NAMES, 'True', [PAGE_IDS.ALL_TOKENS]);
    const RecycledRowId = /* RecycledRow?.RowId || */ 3000000248; // Fallback to the known True ID if row retrieval fails

    // Check if a format entry exists with the given itemId in the Object field
    let format = await this.formatRepository.findOne({ where: { Object: itemId } });

    if (!format) {
      // If no match is found, create a new format entry
      format = new Format();
      format.Object = itemId;
      format.User = userId as any;
      format.ObjectType = 3000000601 as any; // Reference to the Row entity
      format.Recycled = RecycledRowId as any; // Use the retrieved or fallback True ID
      format.RecycledBy = userId as any; // Reference to the User entity
      format.RecycledAt = new Date();
    } else {
      // Optionally, update existing format details if necessary
      format.RecycledBy = userId as any; // Reference to the User entity
      format.Recycled = RecycledRowId as any; // Use the retrieved or fallback True ID
      format.RecycledAt = new Date();
    }

    // Save the format entry
    return await this.formatRepository.save(format);
  }
  // check the column id exist in format and update the format table
  async editColumnFormat(colid: number,  userId: number, updateData: Partial<any>): Promise<any> {
     // Find the format entry by the colid (stored in the Object field)
     let format = await this.formatRepository.findOne({ where: { Object: colid } });
  
     if (format) {
       // If format entry is found, update it with the provided data
       Object.assign(format, updateData);
     } else {
       // If no format entry is found, create a new one with the colid, userId, and fixed ObjectType
       format = this.formatRepository.create({
         Object: colid,
         ObjectType: 3000000589 as any, // Fixed ObjectType value
         ...updateData,
         User: userId as any,
       });
     }
   
     // Set the User entity reference
     format.User = userId as any;
   
     // Save the updated or new format entry
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
  // update the local Coll
  async updatelocalcolls(colid: number, userId: number, updateData: Partial<any>): Promise<any> {
    // Find the format entry by the colid (stored in the Object field)
    let format = await this.formatRepository.findOne({ where: { Object: colid } });
  
    if (format) {
      // If format entry is found, update it with the provided data
      Object.assign(format, updateData);
    } else {
      // If no format entry is found, create a new one with the colid, userId, and fixed ObjectType
      format = this.formatRepository.create({
        Object: colid,
        ObjectType: 3000000590 as any, // Fixed ObjectType value
        ...updateData,
        User: userId as any,
      });
    }
  
    // Set the User entity reference
    format.User = userId as any;
  
    // Save the updated or new format entry
    return await this.formatRepository.save(format);
  }
  
  // update the shared Coll
  async updatesharedcolls(colid: number, userId: number, updateData: Partial<Format>): Promise<Format> {
      // Find the format entry by the colid (stored in the Object field)
      let format = await this.formatRepository.findOne({ where: { Object: colid } });
  
      if (format) {
        // If format entry is found, update it with the provided data
        Object.assign(format, updateData);
      } else {
        // If no format entry is found, create a new one with the colid, userId, and fixed ObjectType
        format = this.formatRepository.create({
          Object: colid,
          ObjectType: 3000000591 as any, // Fixed ObjectType value
          ...updateData,
          User: userId as any,
        });
      }
    
      // Set the User entity reference
      format.User = userId as any;
    
      // Save the updated or new format entry
      return await this.formatRepository.save(format);
    }
  // update the local item
  async updatelocalitem(itemId: number, userId: number, updateData: Partial<Format>): Promise<Format> {
    // Find the format entry by the ItemId (stored in the Object field)
    let format = await this.formatRepository.findOne({ where: { Object: itemId } });
  
    if (format) {
      // If format entry is found, update it with the provided data
      Object.assign(format, updateData);
    } else {
      // If no format entry is found, create a new one with the ItemId, userId, and fixed ObjectType
      format = this.formatRepository.create({
        Object: itemId,
        ObjectType: 3000000602 as any, // Fixed ObjectType value
        ...updateData,
        User: userId as any,
      });
    }
  
    // Set the User entity reference
    format.User = userId as any;
  
    // Save the updated or new format entry
    return await this.formatRepository.save(format);
  }
  // update the shared item
  async updateshareditem(itemId: number, userId: number, updateData: Partial<Format>): Promise<Format> {
     // Find the format entry by the ItemId (stored in the Object field)
     let format = await this.formatRepository.findOne({ where: { Object: itemId } });
  
     if (format) {
       // If format entry is found, update it with the provided data
       Object.assign(format, updateData);
     } else {
       // If no format entry is found, create a new one with the ItemId, userId, and fixed ObjectType
       format = this.formatRepository.create({
         Object: itemId,
         ObjectType: 3000000603 as any, // Fixed ObjectType value
         ...updateData,
         User: userId as any,
       });
     }
   
     // Set the User entity reference
     format.User = userId as any;
   
     // Save the updated or new format entry
     return await this.formatRepository.save(format);
   }
 // Update the local row in the Format table
async updatelocalrow(rowId: number, updateData: Partial<Format>): Promise<Format> {
    // Find the format entry by the rowId (stored in the Object field)
    const format = await this.formatRepository.findOne({ where: { Object: rowId } });
  
    if (!format) {
      throw new Error('Format not found');
    }
  
    // Manually update each property to avoid using Object.assign
    if (updateData.Format !== undefined) format.Format = updateData.Format;
    if (updateData.ObjectType !== undefined) format.ObjectType = updateData.ObjectType;
    if (updateData.Status !== undefined) format.Status = updateData.Status;
    if (updateData.FontStyle !== undefined) format.FontStyle = updateData.FontStyle;
    if (updateData.Comment !== undefined) format.Comment = updateData.Comment;
    if (updateData.TxList !== undefined) format.TxList = updateData.TxList;

    // Save the updated format entry
    return await this.formatRepository.save(format);
  }
  
  // update the shared row
  async updatesharedrow(rowId: number, updateData: Partial<Format>): Promise<Format> {
    // Find the format entry by the itemId (stored in the Object field)
    const format = await this.formatRepository.findOne({ where: { Object: rowId } });

    if (!format) {
      throw new Error('Format not found');
    }

    // Manually update each property to avoid using Object.assign
    if (updateData.Format !== undefined) format.Format = updateData.Format;
    if (updateData.ObjectType !== undefined) format.ObjectType = updateData.ObjectType;
    if (updateData.Status !== undefined) format.Status = updateData.Status;
    if (updateData.FontStyle !== undefined) format.FontStyle = updateData.FontStyle;
    if (updateData.Comment !== undefined) format.Comment = updateData.Comment;
    if (updateData.TxList !== undefined) format.TxList = updateData.TxList;
    // Save the updated format entry
    return await this.formatRepository.save(format);
  }
  async updatelocalCell(cellId: number, userId: number, updateData: Partial<any>): Promise<any> {
    // Find the format entry by the cellId (assuming 'Object' refers to cellId here)
    let format = await this.formatRepository.findOne({ where: { Object: cellId } });
  
    if (format) {
      // If format entry is found, update it with the provided data
      Object.assign(format, updateData);
    } else {
      // If no format entry is found, create a new one with the cellId, userId, and fixed ObjectType
      format = this.formatRepository.create({
        Object: cellId,
        ObjectType: 3000000598 as any, // Fixed ObjectType value
        ...updateData,
        User: userId as any,
      });
    }
  
    // Set the User entity reference
    format.User = userId as any;
  
    // Save the updated or new format entry
    return await this.formatRepository.save(format);
  }
  async updatesharedCell(cellId: number, userId: number, updateData: Partial<any>): Promise<any> {
    // Find the format entry by the cellId (assuming 'Object' refers to cellId here)
    let format = await this.formatRepository.findOne({ where: { Object: cellId } });
  
    if (format) {
      // If format entry is found, update it with the provided data
      Object.assign(format, updateData);
    } else {
      // If no format entry is found, create a new one with the cellId, userId, and fixed ObjectType
      format = this.formatRepository.create({
        Object: cellId,
        ObjectType: 3000000599 as any, // Fixed ObjectType value
        ...updateData,
        User: userId as any,
      });
    }
  
    // Set the User entity reference
    format.User = userId as any;
  
    // Save the updated or new format entry
    return await this.formatRepository.save(format);
  }
  
}
