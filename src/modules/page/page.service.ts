import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Page } from './page.entity';
import { Item } from 'modules/item/item.entity';

@Injectable()
export class PageService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
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
