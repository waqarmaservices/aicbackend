import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { Page } from './page.entity';
import { Item } from 'modules/item/item.entity';
import { Cell } from 'modules/cell/cell.entity';
import { Col } from 'modules/col/col.entity';
import { CellService } from 'modules/cell/cell.service';
import { Row } from 'modules/row/row.entity';

@Injectable()
export class PageService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
    @InjectRepository(Cell)
    private readonly cellRepository: Repository<Cell>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly cellService: CellService
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
        where: { PG: pageId },
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

  async getOnePageColumns(pageId: number): Promise<any> {
    try {
      const pageTypeColId = 2000000047; // Col-ID of Page Type
      const pageNameColId = 2000000049; // Col-ID of Page Name
      const pageId = 1000000006;
      const eachPageRowId = 3000000329; // Row-ID each page Page Type
      const productPageRowId = 3000000332; // Row-ID each page Page Type
      
      // Items IDs
      const itemIds = await this.entityManager.find(Item,{
        select: {Item: true},
        where: [
          { Object: eachPageRowId},
          { Object: pageId},
          { Object: productPageRowId }
        ],
        order: { Item: 'ASC' }
      })
      .then(items => items.map((item) => {
        const itemIdObject = [];
        itemIdObject.push(item.Item)
        return itemIdObject;
      }))
  

      // item cell ids
      const itemCellIds = await this.entityManager.find(Cell, {
        where: {
          Items: In(itemIds),
        },
        order: { Cell: "ASC"},
      })
      .then(itemCells => itemCells.map((cell) => cell.Cell))

      // Filtered Cells
      const itemCellRowIds = await this.entityManager.find(Cell, {
        where: {
          Cell: In(itemCellIds),
        },
        relations: ['Col', 'Row']
      })
      .then(itemCellRowIds => itemCellRowIds.map((cell) => cell.Row.Row))
      
      // Col-Rows
      const colItemIds = await this.entityManager.find(Cell, {
        where: {
          Row: In(itemCellRowIds),
          ColN: pageNameColId,
        },
        relations: ['Col', 'Row'], 
      })
      .then(colRowsItemIds => colRowsItemIds.map((cell) => {
        return cell.Items.toString().replace(/[{}]/g, "");
      }))

      // col names
      const colNames = await this.entityManager.find(Item, {
        where: {
          Item: In(colItemIds),
        },
      })
      .then(items => items.map((item) => {
        return item.JSON[3000000100]
      }));

      // Cells
      // const cells = await this.entityManager.findBy(Cell, {
      //   Items: In(itemIds),
      // })
      // const cellIds = cells.map((cell) => cell)
      // return cellIds
  

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
}
