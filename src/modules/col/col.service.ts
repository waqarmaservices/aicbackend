import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Col } from './col.entity';
import { Format } from 'modules/format/format.entity';
import { FormatService } from 'modules/format/format.service';
import { SYSTEM_INITIAL } from '../../constants';
import { Row } from 'modules/row/row.entity';
import { CellService } from 'modules/cell/cell.service';
import { ItemService } from 'modules/item/item.service';
import { PageService } from 'modules/page/page.service';
import { RowService } from 'modules/row/row.service';

@Injectable()
export class ColService {
  constructor(
    @InjectRepository(Col)
    private readonly colRepository: Repository<Col>,
    @Inject(forwardRef(() => FormatService))
    private readonly formatService: FormatService,
    private readonly rowService: RowService,
    @Inject(forwardRef(() => PageService))
    private readonly pageService: PageService,
  ) {}
  /**
   * Creates a new Col.
   *
   * @returns {Promise<Col>} The newly created Col.
   */
  async createCol(): Promise<any> {
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
    // First, update the entity by its ID
    await this.colRepository.update(id, updateData);
    // Then, retrieve the updated entity by the Col field
    const updateCol = await this.colRepository.findOne({ where: { Col: updateData.Col } });
    return updateCol;
  }

  /**
   * Deletes one Col based on provided col ID
   *
   * @param {number} id - The ID of the Col to delete.
   * @returns {Promise<void>}
   */
  async deleteCol(id: number): Promise<any | null> {
    // Fetch the Column to get the Col value before deletion
    const Column = await this.colRepository.findOne({ where: { Col: id } });

    if (!Column) {
      return null; // Return null if the Column does not exist
    }

    // Delete the Column by its ID
    await this.colRepository.delete(id);
    // Return the Column value of the deleted Column
    return Column.Col;
  }
  // Add Columns record With Format Record
  async createColAndFormat(): Promise<{ createdcol: Col; createdFormat: Format }> {
    // Step 1:Create the new column entity
    const createdcol = await this.createCol();

    // Step 2 :Create the corresponding format
    const createdFormat = await this.formatService.createFormat({
      User: 3000000099 as any, 
      ObjectType: 3000000590 as any, 
      Object: createdcol.Col,
    });

    // Return both created entities
    return { createdcol, createdFormat };
  }
  // Createing Col and Row 
    async createColAndRow(payload: any): Promise<{ createdCol: Col; createdRow: Row }> {
        const { Pg, RowLevel, Share, Inherit, RowType, ParentRow, SiblingRow } = payload;

        // Step 1: Create a new column
        const newCol = this.colRepository.create(); // Adjust this if you need to include specific column data from the payload
        const createdCol = await this.colRepository.save(newCol);
        if (!createdCol) {
            throw new Error('Failed to create column');
        }

        // Step 2: Find the page by Pg ID
        const page = await this.pageService.findOne(Pg); // Correctly find the page using the Pg ID
        if (!page) {
            throw new Error('Page not found');
        }

        // Log or handle the existing columns if needed
        const existingCols = page.Cols; // Access columns from the page object

        // Step 3: Create the row using the createRow function from RowService
        const rowPayload = {
            Pg, // Foreign key reference to the page
            RowLevel,
            Share,
            Inherit,
            RowType,
            ParentRow,
            SiblingRow,
        };

        const createdRow = await this.rowService.createRow(rowPayload);
        if (!createdRow) {
            throw new Error('Failed to create row');
        }

        // Return the created column and row
        return { createdCol, createdRow };
    }
}
