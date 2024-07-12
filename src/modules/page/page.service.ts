import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { Page } from './page.entity';
import { Item } from 'modules/item/item.entity';
import { Cell } from 'modules/cell/cell.entity';
import { CellService } from 'modules/cell/cell.service';
import { RowService } from 'modules/row/row.service';
import { SYSTEM_INITIAL, TOKEN_NAMES } from '../../constants';
import { ApiResponse } from 'common/dtos/api-response.dto';
import { ColService } from 'modules/col/col.service';
import { ImportService } from 'modules/import/import.service';

@Injectable()
export class PageService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
    @InjectRepository(Cell)
    private readonly cellRepository: Repository<Cell>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly cellService: CellService,
    private readonly rowService: RowService,
    private readonly colService: ColService
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
    return await this.pageRepository.findOne({ where: { Pg: id } });
  }

  /**
   * Updates one PG based on provided PG ID.
   *
   * @param {number} id - The ID of the PG to update.
   * @param {Partial<Page>} updateData - The data to update the PG with.
   * @returns {Promise<Page | null>} The updated PG, or null if not found.
   */
  async updatePage(id: number, updateData: Partial<Page>): Promise<Page | null> {
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
  async getOnePage(pageId: number): Promise<any> {
    try {
      const page = await this.entityManager.findOne(Page, {
        where: { Pg: pageId },
        relations: ['rows', 'rows.cells', 'rows.cells.Col'],
      });

      if (!page) {
        throw new Error('Page not found');
      }

      // Extract all item IDs from cells
      const itemIdsSet = new Set<number>();
      for (const row of page.rows) {
        for (const cell of row.cells) {
          if (cell.Items) {
            let itemsArray: number[] = [];

            // Ensure cell.Items is handled correctly based on its type
            if (typeof cell.Items === 'string') {
              //@ts-ignore
              itemsArray = cell.Items.replace(/[{}]/g, '') // Remove braces
                .split(',')
                .map((item) => parseInt(item.trim(), 10)); // Convert to array of numbers
            } else if (Array.isArray(cell.Items)) {
              itemsArray = cell.Items as number[];
            }

            itemsArray.forEach((itemId) => itemIdsSet.add(itemId));
          }
        }
      }
      const itemIds = Array.from(itemIdsSet);

      // Retrieve the complete records of each item ID
      const items = await this.entityManager.findByIds(Item, itemIds);

      // Replace item IDs in cells with full item records
      for (const row of page.rows) {
        for (const cell of row.cells) {
          if (cell.Items) {
            let itemsArray: number[] = [];

            // Ensure cell.Items is handled correctly based on its type
            if (typeof cell.Items === 'string') {
              // @ts-ignore
              itemsArray = cell.Items.replace(/[{}]/g, '') // Remove braces
                .split(',')
                .map((item) => parseInt(item.trim(), 10)); // Convert to array of numbers
            } else if (Array.isArray(cell.Items)) {
              itemsArray = cell.Items as number[];
            }

            cell.Items = itemsArray.map((itemId) => items.find((item) => item.Item === itemId) || itemId) as any;
          }
        }
      }

      return {
        success: true,
        data: {
          page,
        },
        error: '',
        statusCode: 200,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        data: null,
        error: (error as Error).message,
        statusCode: 500,
      };
    }
  }

  /**
   * Finds Pg Cols based on provided Pg ID.
   *
   * @param {number} pageId - The ID of the PG to find.
   * @returns {Promise<ApiResponse>} The reponse of Pg Cols.
   */
  async getOnePageColumns(pageId: number): Promise<ApiResponse<any>> {
    try {
      const colNameColId = 2000000049; // Col-ID of Col Name
      const eachPageTypeRowId = 3000000329; // Row-ID each page Page Type
      const pagetype = await this.findPageType(pageId);
      const pageTypeId = pagetype 
        ? (pagetype.Token === TOKEN_NAMES.PageType.PageList ? null : pagetype.Row_Id)
        : null;
          
      // Item IDs
      const itemIds = await this.entityManager.find(Item, {
        select: { Item: true },
        where: [
          { Object: eachPageTypeRowId },
          { Object: pageId},
          { Object: pageTypeId ? pageTypeId : pageId }
        ],
        order: { Item: 'ASC' }
      })
      .then(items => items.map((item) => [item.Item]));

      // Row IDs from tCell using Item IDs
      const rowIds = await this.entityManager.find(Cell, {
        where: {
          Items: In(itemIds),
        },
        order: { Cell: "ASC"},
      })
      .then(cells => cells.map((cell) => cell.CellRow.Row));
      
      // Col IDs from tCell using Row IDs
      const colIds = await this.entityManager.find(Cell, {
        where: {
          Row: In(rowIds),
          Col: colNameColId,
        },
        relations: ['CellCol', 'CellRow'], 
      })
      .then(cells => cells.map((cell) => {
        return cell.Items.toString().replace(/[{}]/g, "");
      }));

      // Getting Col names from tItem
      const colNames = await this.entityManager.find(Item, {
        where: {
          Item: In(colIds),
        },
      })
      .then(items => items.map(item => ({
        title: item.JSON[SYSTEM_INITIAL.ENGLISH],
        field: item.JSON[SYSTEM_INITIAL.ENGLISH].replace(/[\s-]+/g, '_').toLowerCase()
      })));

      return {
        success: true,
        data: {
          colNames,
        },
        error: '',
        statusCode: 200,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        data: null,
        error: (error as Error).message,
        statusCode: 500,
      };
    }
  }

  async getAllPages(): Promise<any> {
    try {
      const pages = await this.entityManager.find(Page, {
        relations: ['rows', 'rows.cells', 'rows.cells.Col'],
      });

      if (!pages || pages.length === 0) {
        throw new Error('No pages found');
      }

      // Process each page to extract and retrieve full item records
      for (const page of pages) {
        const itemIdsSet = new Set<number>();
        for (const row of page.rows) {
          for (const cell of row.cells) {
            if (cell.Items) {
              let itemsArray: number[] = [];

              // Ensure cell.Items is handled correctly based on its type
              if (typeof cell.Items === 'string') {
                //@ts-ignore
                itemsArray = cell.Items.replace(/[{}]/g, '') // Remove braces
                  .split(',')
                  .map((item) => parseInt(item.trim(), 10)); // Convert to array of numbers
              } else if (Array.isArray(cell.Items)) {
                itemsArray = cell.Items as number[];
              }

              itemsArray.forEach((itemId) => itemIdsSet.add(itemId));
            }
          }
        }

        const itemIds = Array.from(itemIdsSet);
        const items = await this.entityManager.findByIds(Item, itemIds);

        // Replace item IDs in cells with full item records
        for (const row of page.rows) {
          for (const cell of row.cells) {
            if (cell.Items) {
              let itemsArray: number[] = [];

              // Ensure cell.Items is handled correctly based on its type
              if (typeof cell.Items === 'string') {
                //@ts-ignore
                itemsArray = cell.Items.replace(/[{}]/g, '') // Remove braces
                  .split(',')
                  .map((item) => parseInt(item.trim(), 10)); // Convert to array of numbers
              } else if (Array.isArray(cell.Items)) {
                itemsArray = cell.Items as number[];
              }

              cell.Items = itemsArray.map((itemId) => items.find((item) => item.Item === itemId, itemId)) as any;
            }
          }
        }
      }

      return {
        success: true,
        data: {
          pages,
        },
        error: '',
        statusCode: 200,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        data: null,
        error: (error as Error).message,
        statusCode: 500,
      };
    }
  }

  /**
   * Finds Pg type based on provided Pg ID.
   *
   * @param {number} pageId - The ID of the PG to find.
   * @returns {Promise<any>} The reponse of Pg type.
   */
  async findPageType(pageId: number): Promise<any> {
    const pageTypeColId = 2000000039; // Col-ID of Page Type-Col
    const pgRow = await this.rowService.findOneByColumnName('Pg', pageId);

    if (pgRow) {
      const itemId = await this.entityManager.findOne(Cell, {
        where: { 
          Row: pgRow.Row,
          Col: pageTypeColId
        }
      })
      .then(cell => cell ? cell.Items.toString().replace(/[{}]/g, "") : null);
  
      if (itemId) {
        const cellItem = await this.entityManager.findOne(Item, {
          where: { Item: Number(itemId) }
        });
        
        if (cellItem != null) {
          const rowJson = await this.getRowJson(cellItem.Object);
          return rowJson;
        }
      }
    }

    return null;
  }

  /**
   * Finds Row JSON based on provided Row ID.
   *
   * @param {number} rowId - The ID of the PG to find.
   * @returns {object} The JSON for Row ID.
   */
  private async getRowJson(rowId: number) {
    const row = await this.rowService.findOne(rowId);
    const cell = await this.entityManager.findOne(Cell, {
      where: {
        Row: row.Row,
        Col: 2000000077
      }
    })
    const itemId = cell.Items.toString().replace(/[{}]/g, "") 
    const item = await this.entityManager.findOne(Item, {
      where: { Item: Number(itemId)}
    })
    return {
      Row_Id: row.Row,
      Token: item.JSON[SYSTEM_INITIAL.ENGLISH]
    }
  }
}
