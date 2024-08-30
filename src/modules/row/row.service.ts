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

@Injectable()
export class RowService {
  constructor(
    @InjectRepository(Row)
    private readonly rowRepository: Repository<Row>,
    private readonly formatService: FormatService,
    private readonly cellService: CellService,
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
  
// Create Pg - Row
async createPgRow(payload: any): Promise<{ createdPage: Page; createdRow: Row; createdFormats: Format[]; createdCells: Cell[] }> {
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
      Pg: payload.Pg  // Use original Pg ID from the payload
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
      User: 3000000099,  
      ObjectType: 3000000577, 
      Object: createdPage.Pg,  // New Pg ID
    };
    const createdFormatPg = await this.formatService.createFormat(formatPayloadPg);
  
    // Step 6: Create the second Format entity using the new Row ID in the Object field
    const formatPayloadRow = {
      User: 3000000099,
      ObjectType: 3000000588,
      Object: completeRow.Row,  // New Row ID
    };
    const createdFormatRow = await this.formatService.createFormat(formatPayloadRow);

    // Step 7: Create Cells for each fixed column ID using the new Row ID
    const createdCells: Cell[] = [];
    for (let colId of fixedColIds) {
  
      // Create cell for each fixed column ID with the new Row ID
      const cellData = {
        Row: completeRow.Row,
        Col: colId,
      };
      const createdCell = await this.cellService.createCell(cellData);
      createdCells.push(createdCell);
    }
  
    return { 
      createdPage, 
      createdRow: completeRow, 
      createdFormats: [createdFormatPg, createdFormatRow], 
      createdCells 
    };
  }

  async getRowsByPgs(Pgs: number[]): Promise<Row[]> {
    return await this.rowRepository.find({
      where: { Pg: In(Pgs) },
      relations: ['cells'],
    });
  }
}
