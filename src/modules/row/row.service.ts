import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Row } from './row.entity';
import { PageService } from 'modules/page/page.service';
import { FormatService } from 'modules/format/format.service';
import { Format } from 'modules/format/format.entity';
import { SYSTEM_INITIAL } from '../../constants';
import { Col } from 'modules/col/col.entity';
import { CellService } from 'modules/cell/cell.service';
import { Cell } from 'modules/cell/cell.entity';

@Injectable()
export class RowService {
    constructor(
        @InjectRepository(Row)
        private readonly rowRepository: Repository<Row>,
        private readonly formatService: FormatService,
        private readonly cellService: CellService,
        @Inject(forwardRef(() => PageService))
        private readonly pageService: PageService,
    ) { }

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
            return null;  // Return null if the Row does not exist
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
    async createRowWithFormat(payload: any): Promise<{ createdRow: Row; createdFormat: Format; createdCells: Cell[] }> {
        // Step 1: Create the Row entity
        const createdRow = await this.rowRepository.save({
            Pg: payload.Pg,
            RowLevel: payload.RowLevel,
            ParentRow: payload.ParentRow,
            SiblingRow: payload.SiblingRow,
        });

        // Step 2: Create the Format entity
        const createdFormat = await this.formatService.createFormat({
            User: SYSTEM_INITIAL.USER_ID as any,
            ObjectType: SYSTEM_INITIAL.ROW as any,
            Object: createdRow.Row,
        });

        // Step 3: Identify the column IDs using PageService
        const pageColumns = await this.pageService.getPageColumnsids(payload.Pg);
        const columnIds = pageColumns.column_names.map(col => col.column_id);

        // Step 4: Create cells for each column ID
        const createdCells: Cell[] = [];
        for (const colId of columnIds) {
            const createdCell = await this.cellService.createCell({
                Row: createdRow.Row,
                Col: colId,
                // Add any additional properties needed for the cell here
            });
            createdCells.push(createdCell);
        }

        // Return the created row, format, and cells
        return { createdRow, createdFormat, createdCells };
    }

    async getRowsByPgs(Pgs: number[]): Promise<Row[]> {
        return await this.rowRepository.find({
          where: { Pg: In(Pgs) },
          relations: ['cells'],
        });
    }

}