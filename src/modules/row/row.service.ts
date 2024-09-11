import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Row } from './row.entity';
import { PageService } from 'modules/page/page.service';
import { FormatService } from 'modules/format/format.service';
import { Format } from 'modules/format/format.entity';
import { SYSTEM_INITIAL } from '../../constants';
import { Col } from 'modules/col/col.entity';
import { CellService } from 'modules/cell/cell.service';
import { Cell } from 'modules/cell/cell.entity';
import { Page } from 'modules/page/page.entity';
import { ItemService } from 'modules/item/item.service';

@Injectable()
export class RowService {
  constructor(
    @InjectRepository(Row)
    private readonly rowRepository: Repository<Row>,
    @Inject(forwardRef(() => FormatService))
    private readonly formatService: FormatService,
    @Inject(forwardRef(() => CellService))
    private readonly cellService: CellService,
    private readonly itemService: ItemService,
    @Inject(forwardRef(() => PageService))
    private readonly pageService: PageService,
  ) {}

  async createRow(payload: any): Promise<Row> {
    // Step 1: Create the row data
    const rowData = this.rowRepository.create(payload);

    // Step 2: Save the row data to the database
    const savedRow = await this.rowRepository.save(rowData);

    // Ensure `savedRow` is treated as a single `Row` object
    const savedRowId = (savedRow as unknown as Row).Row;

    // Step 3: Fetch the saved row with all relations to return a complete response
    const completeRow = await this.rowRepository.findOne({
      where: { Row: savedRowId },
      relations: ['Pg', 'Share', 'ParentRow', 'SiblingRow'], // Ensure all necessary relations are included
    });

    // If for some reason `completeRow` is null, handle it
    if (!completeRow) {
      throw new Error('Row not found after creation');
    }

    return completeRow;
  }
  async findAll(): Promise<any> {
    return this.rowRepository.find({});
  }
  async findOne(id: number): Promise<Row | null> {
    return this.rowRepository.findOne({
      where: { Row: id },
      relations: ['Pg', 'Share', 'ParentRow', 'SiblingRow'], // Include all the necessary relations
    });
  }
  async findOneByColumnName(col: string, value: number | string): Promise<Row> {
    return await this.rowRepository.findOne({
      where: { [col]: value },
    });
  }

  async findPreviousRow(id: number): Promise<Row | undefined> {
    return this.rowRepository
      .createQueryBuilder('t-Row')
      .where('tRow.Row < :id', { id })
      .orderBy('tRow.Row', 'DESC')
      .getOne();
  }

  async findNextRow(id: number): Promise<Row | undefined> {
    return this.rowRepository
      .createQueryBuilder('t-Row')
      .where('tRow.Row > :id', { id })
      .orderBy('tRow.Row', 'ASC')
      .getOne();
  }

  async updateRow(id: number, updateData: Partial<Row>): Promise<Row | null> {
    // First, update the entity by its ID
    await this.rowRepository.update(id, updateData);

    // Then, retrieve the updated entity using the original ID
    const updatedRow = await this.rowRepository.findOne({
      where: { Row: id },
      relations: ['Pg', 'Share', 'ParentRow', 'SiblingRow'], // Include all the necessary relations
    });

    return updatedRow;
  }

  async deleteRow(id: number): Promise<any | null> {
    // Fetch the Row to get the Row value before deletion
    const row = await this.rowRepository.findOne({ where: { Row: id } });

    if (!row) {
      return null; // Return null if the Row does not exist
    }

    // Delete the Row by its ID
    await this.rowRepository.delete(id);

    // Return the Row value of the deleted page
    return row.Row;
  }

  async findAllOrderByIdAsc(): Promise<Row[]> {
    return this.rowRepository.find({
      order: { Row: 'ASC' },
      relations: ['Pg', 'Share', 'ParentRow', 'SiblingRow'],
    });
  }

  async findAllOrderByIdDesc(): Promise<Row[]> {
    return this.rowRepository.find({
      order: { Row: 'DESC' },
      relations: ['Pg', 'Share', 'ParentRow', 'SiblingRow'],
    });
  }

  async getLastInsertedRecord(): Promise<Row> {
    const rows = await this.rowRepository.find({
      order: {
        Row: 'DESC',
      },
      take: 1,
    });
    return rows[0];
  }

  async findPageLastRow(pageId: number): Promise<Row> {
    return await this.rowRepository
      .createQueryBuilder('tRow')
      .where('tRow.Pg = :pageId', { pageId })
      .orderBy('tRow.Row', 'DESC')
      .getOne();
  }

  async getRowsByPgs(Pgs: number[]): Promise<Row[]> {
    return await this.rowRepository.find({
      where: { Pg: In(Pgs) },
      relations: ['cells'],
    });
  }
  
  /// Create Pg - Row - Format - Cells - Item 
  async createPgRow(payload: any): Promise<{ createdPage: Page; createdRow: Row; }> {
    // Step 1: Fetch the existing Page details using the Pg ID from the payload
    const existingPage = await this.pageService.findOne(payload.Pg); // Assuming findOne is a method in pageService
    if (!existingPage) {
      throw new Error('Page not found with the provided Pg ID');
    }
    // Step 2: Create a new Page using the fixed column IDs
    const fixedColIds = [2000000001, 2000000002, 2000000003, 2000000004, 2000000005, 2000000006];
    const createdPage = await this.pageService.createPage(fixedColIds);
    // Step 3: Create the Row entity with the original Pg ID from the payload
    const rowData = this.rowRepository.create({
      ...payload,
      Pg: payload.Pg, // Use original Pg ID from the payload
    });
    const savedRow = await this.rowRepository.save(rowData);
    const savedRowId = (savedRow as unknown as Row).Row;
    // Step 4: Fetch the saved Row with all relations to return a complete response
    const completeRow = await this.rowRepository.findOne({
      where: { Row: savedRowId },
      relations: ['Pg', 'Share', 'ParentRow', 'SiblingRow'],
    });
    if (!completeRow) {
      throw new Error('Row not found after creation');
    }
    // Step 5: Create the first Format entity using the new Pg ID in the Object field
    const formatPayloadPg = {
      User: payload.userid,
      ObjectType: 3000000582,
      Object: createdPage.Pg, // New Pg ID
    };
    const createdFormatPg = await this.formatService.createFormat(formatPayloadPg);
    // Step 6: Create the second Format entity using the new Row ID in the Object field
    const formatPayloadRow = {
      User: payload.userid,
      ObjectType: 3000000594,
      Object: completeRow.Row, // New Row ID
    };
    const createdFormatRow = await this.formatService.createFormat(formatPayloadRow);
    // Step 7: Create Cells for each column in the payload.Pg.Cols using the new Row ID
    const allColsString = existingPage.Cols; // Get the column string from the existing page
    // Properly parse the column string into an array of column IDs
    const allCols = allColsString.replace(/[{}]/g, '').split(',').map(id => id.trim());
    const createdCells: Cell[] = [];
    for (let col of allCols) {
      // Create a cell for each column with the new Row ID
      const cellData = {
        Row: completeRow.Row,
        Col: col,
      };
      const createdCell = await this.cellService.createCell(cellData);
      createdCells.push(createdCell);
    }
    // Step 8: Create Item using the new generated Pg ID stored against tItem.Object and DataType: 3000001016
    const itemPayload = {
      Object: createdPage.Pg, // New Pg ID
      DataType: 3000000582,
      // Additional item properties can be added here
    };
    const createdItem = await this.itemService.createItem(itemPayload);
    if (!createdItem) {
      throw new Error('Item not created');
    }
   // Step 9: Fetch Page Columns and their details using PageService.getPageColumns
    const pageColumns = await this.pageService.getPageColumns(existingPage.Pg);
    const columnsData = pageColumns.map((column) => ({
      col: column.col,
      title: column.title,
      field: column.field,
      status: column.status,
    }));
    // Dynamically find the column with the title "Page ID"
    const pageIdColumn = columnsData.find(column => column.title === "Page ID");
    if (!pageIdColumn) {
      throw new Error('column not found');
    }
    // Extract the "col" value for "Page ID"
    const pageIdColValue = pageIdColumn.col;
    // Step 10: Find the cell using pageIdColValue and the generated Row
    const foundCell = await this.cellService.findCellByColAndRow(pageIdColValue, completeRow.Row);
    if (!foundCell) {
      throw new Error('Cell not found for the column and Row');
    }
    // Step 11: Update the Cell.Items array with the newly created Item ID
    const updatedCell = await this.cellService.updateCellitem(foundCell.Cell, { Items: [createdItem.Item] });
    if (!updatedCell) {
      throw new Error('Failed to update the Cell with the new Item ID');
    } 
    // Step 12: Clear cache for the page
    const clean = await this.pageService.clearPageCache(payload.Pg.toString()); // Clear cache for this page
    console.log(clean);
    // Return all created entities and the additional column details, including the Page ID
    return {
      createdPage,
      createdRow: completeRow,
    };
  }
}
