import { Injectable, Inject } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { Page } from './page.entity';
import { Item } from 'modules/item/item.entity';
import { Cell } from 'modules/cell/cell.entity';
import { CellService } from 'modules/cell/cell.service';
import { RowService } from 'modules/row/row.service';
import {
  ALL_DATATYPES,
  COLUMN_IDS,
  GENERAL,
  PAGE_CACHE,
  SHEET_NAMES,
  SYSTEM_INITIAL,
  TOKEN_IDS,
  TOKEN_NAMES,
} from '../../constants';
import { ApiResponse } from 'common/dtos/api-response.dto';
import { ColService } from 'modules/col/col.service';
import { ItemService } from 'modules/item/item.service';
import { Format } from 'modules/format/format.entity';
import { FormatService } from 'modules/format/format.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';
import { Col } from 'modules/col/col.entity';

@Injectable()
export class PageService {
  private readonly uploadPath = path.join('uploads');
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @Inject('PG_CONNECTION') 
    private pool: Pool,
    private readonly cellService: CellService,
    private readonly rowService: RowService,
    private readonly itemService: ItemService,
    private readonly formatService: FormatService,
  ) {
    // Create the upload directory if it doesn't exist
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async createPage(cols: number[]): Promise<Page> {
    // Create a new Page entity with validated data
    const pageData = this.pageRepository.create({ Cols: cols });

    // Save the new Page entity to the database
    return await this.pageRepository.save(pageData);
  }

  async findAll(): Promise<Page[]> {
    return await this.pageRepository.find();
  }

  /**
   * Finds one PG based on provided PG ID.
   *
   * @param {number} id - The ID of the PG to find.
   * @returns {Promise<Page | null>} The found PG, or null if not found.
   */
  async findOne(id: number): Promise<any | null> {
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
    // First, update the entity by its ID
    await this.pageRepository.update(id, updateData);

    // Then, retrieve the updated entity by the Pg field
    const updatedPage = await this.pageRepository.findOne({ where: { Pg: updateData.Pg } });

    return updatedPage;
  }

  /**
   * Deletes one PG based on provided PG ID.
   *
   * @param {number} id - The ID of the PG to delete.
   * @returns {Promise<void>}
   */
  async deletePage(id: number): Promise<any | null> {
    // Fetch the page to get the Pg value before deletion
    const page = await this.pageRepository.findOne({ where: { Pg: id } });

    if (!page) {
      return null; // Return null if the page does not exist
    }

    // Delete the page by its ID
    await this.pageRepository.delete(id);

    // Return the Pg value of the deleted page
    return page.Pg;
  }

  async getPageColumns(pageId: number) {
    const pgCols = await this.findPageColumns(pageId);
    const pgColResponse: any = [];

    for (const col of pgCols) {
      const colFormat = await this.entityManager.findOne(Format, {
        where: {
          Object: col.column_id,
        },
      });
      const colStatuses = await this.getColStatuses(colFormat);

      pgColResponse.push({
        col: col.column_id,
        title: col.column_name?.trim(),
        field: this.transformColName(col?.column_name),
        datatype: col.column_datatype?.trim(),
        status: colStatuses,
      });
    }
    return pgColResponse;
  }

  async getPageColumnsFromRawQuery(pageId: number) {
    const client = await this.pool.connect();
    const allCols = await this.getAllCols();
    const allColsPageId = 1000000006;
    
    const pgRowsQuery = `
      SELECT 
        tRow."Row" AS "tRow_Row",
        tCell."Cell" AS "tCell_Cell", 
        tCell."Col" AS "tCell_Col", 
        tCell."Items" AS "tCell_Items", 
        tItem."Item" AS "tItem_Item",
        tItem."DataType" AS "tItem_DataType", 
        tItem."Object" AS "tItem_Object",
        tItem."JSON" AS "tItem_JSON",
        tCellItemObject."Row" AS "tCell_ItemObject",
        tItemObject."JSON" AS "tItemObject_JSON"
    
      FROM "tCell" tCell
      LEFT JOIN "tItem" tItem ON tItem."Item" = ANY(tCell."Items")
      LEFT JOIN "tRow" tRow ON tRow."Row" = tCell."Row"

      LEFT JOIN "tCell" tCellItemObject ON tCellItemObject."Row" = tItem."Object"
      LEFT JOIN "tItem" tItemObject ON tItemObject."Item" = ANY(tCellItemObject."Items")
    
      WHERE tRow."Pg" = ${allColsPageId}
       ORDER BY tRow."Row" ASC;
    `;

    const pgFormatsQuery = `
      SELECT 
        tPg."Pg" AS "tPg_Pg",
        tPg."Cols" AS "tPg_Cols", 
        tFormat."Format" AS "tFormat_Format", 
        tFormat."Object" AS "tFormat_Object",
        tFormat."Status" AS "tFormat_Status",

        tCell."Items" as "tCell_Items",
        tCell."Cell" as "tCell_Cell",
        tItem."JSON" as "tItem_JSON"
      
      FROM "tPg" tPg
      LEFT JOIN "tFormat" tFormat ON tFormat."Object" = ANY(tPg."Cols")

      LEFT JOIN "tCell" tCell ON tCell."Row" = ANY(tFormat."Status")
      LEFT JOIN "tItem" tItem ON tItem."Item" = ANY(tCell."Items")

      WHERE tPg."Pg" = ${pageId};
    `;


    // Use Map for better performance and structure
    const result = new Map();
    const pgRows = await client.query(pgRowsQuery);
    const pgFormats = await client.query(pgFormatsQuery);

    // Get rows and their cells
    for (const row of pgRows.rows) {
      // If the row doesn't exist in the result map, initialize it as an array
      if (!result.has(row.tRow_Row)) {
        result.set(row.tRow_Row, []);  // Initialize an array for each tRow_Row
      }

      let column = {};
      
      // Determine the column based on the condition
      const foundedCol = allCols.find(col => col.colId === row.tCell_Col);

      if (!row.tItem_JSON && !row.tItemObject_JSON) {
        column = { 
          cellId : row.tCell_Cell,
          colId:  foundedCol.colId,
          colName: foundedCol.colName,
          cellItems: [row.tItem_Object]
        };

        // Push the column and value into the respective row
        result.get(row.tRow_Row).push(column);

      } else {
        const cell = result.get(row.tRow_Row).find(cell => cell.cellId === row.tCell_Cell);
        const ids = [3000000100, 3000000325];
        const cellItem = ids.reduce((result, id) => 
          result ?? row.tItem_JSON?.[id] ?? row.tItemObject_JSON?.[id], undefined);

        if (!cell) {
          column =  {   
            cellId : row.tCell_Cell,
            colId:  foundedCol.colId,
            colName: foundedCol.colName,
            cellItems: [cellItem]
          };

          // Push the column and value into the respective row
          result.get(row.tRow_Row).push(column);

        } else {
          cell.cellItems.push(cellItem)
        }
      }
    }

    // If you need to convert the Map back to a regular object
    const finalResult = Object.fromEntries(result);

    // Initialize result object
    const transformed = this.transformColDataForRawQuery(finalResult);

    const isAllPagesPage: boolean = pageId == 1000000001 ? true : false; 

    return transformed
      .map(row => {
        if (isAllPagesPage) {
          if (row['Page ID'] == pageId || row['Page Type'] == 'Each Page' || row['Page Type'] == 'Pages List') {
            return row;
          }    
        } else {
          if (row['Page ID'] == pageId || row['Page Type'] == 'Each Page') {
            return row;
          }
        } 
      })
      .filter((row => row != null))
      .map(row => {
        const colStatuses = this.filterRecord('tFormat_Object', row['Col ID'], pgFormats.rows);
        row['Col Status'] = colStatuses.map(status => status[3000000100])
        return row;
      })
  }

  async getPageDataFromRawQuery(pageId: number) {
    const client = await this.pool.connect();
    const allCols = await this.getAllCols();
    
    const pgRowsQuery = `
      SELECT 
        tRow."Row" AS "tRow_Row",
        tCell."Cell" AS "tCell_Cell", 
        tCell."Col" AS "tCell_Col", 
        tCell."Items" AS "tCell_Items", 
        tItem."Item" AS "tItem_Item",
        tItem."DataType" AS "tItem_DataType", 
        tItem."Object" AS "tItem_Object",
        tItem."JSON" AS "tItem_JSON",
        tCellItemObject."Row" AS "tCell_ItemObject",
        tItemObject."JSON" AS "tItemObject_JSON"
    
      FROM "tCell" tCell
      LEFT JOIN "tItem" tItem ON tItem."Item" = ANY(tCell."Items")
      LEFT JOIN "tRow" tRow ON tRow."Row" = tCell."Row"

      LEFT JOIN "tCell" tCellItemObject ON tCellItemObject."Row" = tItem."Object"
      LEFT JOIN "tItem" tItemObject ON tItemObject."Item" = ANY(tCellItemObject."Items")
    
      WHERE tRow."Pg" = ${pageId}
       ORDER BY tRow."Row" ASC;
    `;

    const pgFormatsQuery = `
      SELECT 
        tPg."Pg" AS "tPg_Pg",
        tPg."Cols" AS "tPg_Cols", 
        tFormat."Format" AS "tFormat_Format", 
        tFormat."Object" AS "tFormat_Object",
        tFormat."Status" AS "tFormat_Status",

        tCell."Items" as "tCell_Items",
        tCell."Cell" as "tCell_Cell",
        tItem."JSON" as "tItem_JSON"
      
      FROM "tPg" tPg
      LEFT JOIN "tFormat" tFormat ON tFormat."Object" = ANY(tPg."Cols")

      LEFT JOIN "tCell" tCell ON tCell."Row" = ANY(tFormat."Status")
      LEFT JOIN "tItem" tItem ON tItem."Item" = ANY(tCell."Items")

      WHERE tPg."Pg" = ${pageId};
    `;


    // Use Map for better performance and structure
    const result = new Map();
    const pgRows = await client.query(pgRowsQuery);
    const pgFormats = await client.query(pgFormatsQuery);

    // Get rows and their cells
    for (const row of pgRows.rows) {
      // If the row doesn't exist in the result map, initialize it as an array
      if (!result.has(row.tRow_Row)) {
        result.set(row.tRow_Row, []);  // Initialize an array for each tRow_Row
      }

      let column = {};
      
      // Determine the column based on the condition
      const foundedCol = allCols.find(col => col.colId === row.tCell_Col);

      if (!row.tItem_JSON && !row.tItemObject_JSON) {
        column = { 
          cellId : row.tCell_Cell,
          colId:  foundedCol.colId,
          colName: foundedCol.colName,
          cellItems: [row.tItem_Object]
        };

        // Push the column and value into the respective row
        result.get(row.tRow_Row).push(column);

      } else {
        const cell = result.get(row.tRow_Row).find(cell => cell.cellId === row.tCell_Cell);
        const ids = [3000000100, 3000000325];
        const cellItem = ids.reduce((result, id) => 
          result ?? row.tItem_JSON?.[id] ?? row.tItemObject_JSON?.[id], undefined);

        if (!cell) {
          column =  {   
            cellId : row.tCell_Cell,
            colId:  foundedCol.colId,
            colName: foundedCol.colName,
            cellItems: [cellItem]
          };

          // Push the column and value into the respective row
          result.get(row.tRow_Row).push(column);

        } else {
          cell.cellItems.push(cellItem)
        }
      }
    }

    // If you need to convert the Map back to a regular object
    const finalResult = Object.fromEntries(result);

    // Initialize result object
    const transformed = this.transformColDataForRawQuery(finalResult);

    const isAllPagesPage: boolean = pageId == 1000000001 ? true : false; 

    return transformed
      
      // .map(row => {
      //   const colStatuses = this.filterRecord('tFormat_Object', row['Col ID'], pgFormats.rows);
      //   row['Col Status'] = colStatuses.map(status => status[3000000100])
      //   return row;
      // })
  }

  /**
   * Transforms Col name based on provided Col name.
   *
   * @param {string} column - The name of the Col.
   * @returns {string} The transformed Col name.
   */
  public transformColName(column: string): string {
    // const colName = column == GENERAL.Row ? GENERAL.RowId : column;
    const colName = column;

    return colName
      .toLowerCase()
      .trim()
      .replace(/[\s-]+/g, '_');
  }

  /**
   * Finds Col statuses based on provided Col Format.
   *
   * @param {Format} colFormat - The Format of the Col.
   * @returns {Promise<any>} The reponse of Col statuses.
   */
  async getColStatuses(colFormat: Format): Promise<any> {
    const colStatuses = colFormat.Status.toString().replace(/[{}]/g, '').split(',');
    const response = await Promise.all(
      colStatuses.map(async (status) => {
        return await this.getRowJson(Number(status));
      }),
    );

    return response;
  }

  /**
   * Finds Items based on provided Cells.
   *
   * @param {Array} cells - The Cells to find Items.
   * @returns {Promise<any>} The reponse of Cell Items.
   */
  async getItemsByJson(cells: Cell[]) {
    const itemIds = cells.map((cell) => {
      return cell.Items.toString().replace(/[{}]/g, '');
    });

    // Finds Items of Cells
    const items = await this.entityManager
      .find(Item, {
        where: {
          Item: In(itemIds),
        },
      })
      .then((items) => items.map((item) => item.JSON[SYSTEM_INITIAL.ENGLISH].trim()));

    return items;
  }

  /**
   * Finds Items based on provided Cells.
   *
   * @param {Array} cells - The Cells to find Items.
   * @returns {Promise<any>} The reponse of Cell Items.
   */
  async getItemsByObject(cells: Cell[]) {
    const itemIds = cells.map((cell) => {
      return cell.Items.toString().replace(/[{}]/g, '');
    });

    // Finds Items of Cells
    const items = await this.entityManager
      .find(Item, {
        where: {
          Item: In(itemIds),
        },
      })
      .then((items) => items.map((item) => item.Object));

    return items;
  }

  /**
   * Finds Pg Cols based on provided Pg ID.
   *
   * @param {number} pageId - The ID of the PG to find.
   * @returns {Promise<any>} The reponse of Pg Cols.
   */
  async findPageColumns(pageId: number): Promise<any> {
    try {
      const colNameColId = COLUMN_IDS.ALL_COLS.COL_NAME; // Col-ID of Column 'Col Name'
      const colIdColId = COLUMN_IDS.ALL_COLS.Col_ID; // Col-ID of Column 'Col ID'
      const colDataTypeColId = COLUMN_IDS.ALL_COLS.COL_DATATYPE; // Col-ID of Column 'Col ID'
      const eachPageTypeRowId = TOKEN_IDS.PAGE_TYPE.EACH_PAGE; // Row-ID of Pg type 'Each Page'
      const pageType = await this.findPageType(pageId);
      const pageTypeId = pageType ? (pageType.token === TOKEN_NAMES.PageType.PageList ? null : pageType.row_id) : null;

      // Item IDs
      const itemIds = await this.entityManager
        .find(Item, {
          select: { Item: true },
          where: [{ Object: eachPageTypeRowId }, { Object: pageId }, { Object: pageTypeId ? pageTypeId : pageId }],
          order: { Item: 'ASC' },
        })
        .then((items) => items.map((item) => [item.Item]));

      // Row IDs
      const rowIds = await this.entityManager
        .find(Cell, {
          where: {
            Items: In(itemIds),
          },
          relations: ['CellCol'],
          order: { Cell: 'ASC' },
        })
        .then((cells) => cells.map((cell) => cell.CellRow.Row));

      // Cells of column 'Col Name'
      const colNameCells = await this.entityManager.find(Cell, {
        where: {
          Row: In(rowIds),
          Col: colNameColId,
        },
        order: { Row: 'ASC' },
      });

      // Cells of column 'Col ID'
      const colIdCells = await this.entityManager.find(Cell, {
        where: {
          Row: In(rowIds),
          Col: colIdColId,
        },
        order: { Row: 'ASC' },
      });

      // Cells of column 'Col DataType'
      const colDataTypeCells = await this.entityManager.find(Cell, {
        where: {
          Row: In(rowIds),
          Col: colDataTypeColId,
        },
        order: { Row: 'ASC' },
      });

      const colNameCellItems = await this.getItemsByJson(colNameCells);
      const colIdCellItems = await this.getItemsByObject(colIdCells);
      // Col DataType object IDS
      const colDataTypeCellObjects = await this.getItemsByObject(colDataTypeCells);
      // Col DataType JSON value
      const colDataTypeCellitems = await Promise.all(
        colDataTypeCellObjects.map(async (rowId:number) => {
          return await this.getItemsFromRowIds(rowId.toString());
        })
      );

      const columns = colIdCellItems.map((colId, index) => {
        return {
          column_id: colId,
          column_name: colNameCellItems[index],
          column_datatype: colDataTypeCellitems[index],
        };
      });

      return columns;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  async findPageType(pageId: number): Promise<any> {
    const pageTypeColId = COLUMN_IDS.SHARED.PAGE_TYPE; // Col-ID of Column 'Page Type'
    const pgRow = await this.rowService.findOneByColumnName('Pg', pageId);

    if (pgRow) {
      const itemIds = await this.entityManager
        .findOne(Cell, {
          where: {
            Row: pgRow.Row,
            Col: pageTypeColId,
          },
        })
        .then((cell) => (cell ? cell.Items.toString().replace(/[{}]/g, '') : null));

      if (itemIds) {
        const cellItem = await this.entityManager.findOne(Item, {
          where: { Item: In(itemIds.split(',')) },
        });

        if (cellItem != null) {
          const rowJson = await this.getRowJson(cellItem.Object);
          return {
            row_id: cellItem.Object,
            token: rowJson,
          };
        }
      }
    }

    return null;
  }

  /**
   * Finds Row JSON based on provided Row ID.
   *
   * @param {number} rowId - The ID of the Pg to find.
   * @returns {string} The JSON string for Row ID.
   */
  private async getRowJson(rowId: number, sheetName?: string): Promise<string | null> {
    if (!rowId) return null;
    const searchColId = this.getSearchColId(sheetName);
    const row = await this.rowService.findOne(rowId);
    if (!row) return null;

    const cell = await this.entityManager.findOne(Cell, {
      where: {
        Row: row.Row,
        Col: searchColId,
      },
    });
    if (!cell) return null;

    const itemId = cell.Items?.toString().replace(/[{}]/g, '');
    if (!itemId) return null;

    const item = await this.entityManager.findOne(Item, {
      where: { Item: Number(itemId) },
    });
    return item.JSON[SYSTEM_INITIAL.ENGLISH];
  }

  private getSearchColId(sheetName?: string): number {
    switch (sheetName) {
      case SHEET_NAMES.ALL_LABELS:
        return COLUMN_IDS.ALL_LABELS.LABELS;

      case SHEET_NAMES.ALL_UNITS:
        return COLUMN_IDS.ALL_UNITS.UNIT;

      case SHEET_NAMES.ALL_LANGUAGES:
        return COLUMN_IDS.ALL_LANGUAGES.LANGUAGE;

      case SHEET_NAMES.ALL_REGIONS:
        return COLUMN_IDS.ALL_REGIONS.REGION;

      case SHEET_NAMES.ALL_MODELS:
        return COLUMN_IDS.ALL_MODELS.MODEL;
        
      case SHEET_NAMES.ALL_SUPPLIERS:
        return COLUMN_IDS.ALL_SUPPLIERS.SUPPLIER;
      
      default:
        return COLUMN_IDS.ALL_TOKENS.TOKEN;
    }
  }

  async getAllPages(): Promise<any> {
    try {
      const pages = await this.entityManager.find(Page, {
        relations: ['rows', 'rows.cells', 'rows.cells.CellCol'],
      });

      if (!pages.length) {
        throw new Error('No pages found');
      }

      // Extract all item IDs from cells
      const itemIdsSet = new Set<number>();
      for (const page of pages) {
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
      }
      const itemIds = Array.from(itemIdsSet);

      // Retrieve the complete records of each item ID
      const items = await this.entityManager.findByIds(Item, itemIds);

      // Replace item IDs in cells with full item records and update item JSON attribute
      for (const page of pages) {
        // const pageName = page.PageName || 'All Pages'; // Adjust if your Page entity has a different property for the name

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

              cell.Items = itemsArray.map((itemId) => {
                const item = items.find((item) => item.Item === itemId);
                if (item) {
                  // Update the JSON attribute
                  //   item.JSON = {
                  //     ...item.JSON,
                  //     [page.Pg]: pageName,
                  //   };
                }
                return item || itemId;
              }) as any;
            }
          }
        }
      }

      // Columns definition
      const columns = [
        { title: 'Row*', field: 'row_id', frozen: true, tooltip: true, width: 'auto', editor: false },
        { title: 'Page ID*', field: 'page_id', frozen: true, width: 'auto', tooltip: true, editor: false },
        { title: 'Page Name*', field: 'page_name', width: 'auto', editor: false, tooltip: true },
        { title: 'Page Type', field: 'page_type', tooltip: true, width: 'auto', editor: false },
        { title: 'Page Edition*', field: 'page_edition', tooltip: true, width: 'auto', editor: false },
        { title: 'Page Owner*', field: 'page_owner', tooltip: true, width: 'auto', editor: false },
        { title: 'Page URL', field: 'page_url', tooltip: true, width: 'auto', editor: false },
        { title: 'Page Seo', field: 'page_seo', tooltip: true, width: 'auto', editor: false },
        { title: 'Page Status', field: 'page_status', tooltip: true, width: 'auto', editor: false },
        { title: 'Page Comment', field: 'page_comment', tooltip: true, width: 'auto', editor: false },
        { title: 'Row Type', field: 'row_type', tooltip: true, width: 'auto', editor: false },
        { title: 'Row Status', field: 'row_status', tooltip: true, width: 'auto', editor: false },
      ];

      // Transform the pages data into the tabular format
      const AllPagesData = pages.flatMap((page) =>
        page.rows.map((row) => ({
          row_id: row.Row,
          page_id: page.Pg,
          //   page_name: page.PageName || 'All Pages', // Use actual page name
          page_type: 'Page List', // Example value, replace with actual data if available
          page_edition: 'Default', // Example value, replace with actual data if available
          page_owner: 'Admin', // Example value, replace with actual data if available
          page_url: 'URL to open this Page', // Example value, replace with actual data if available
          page_seo: 'Pg; Page; Pages', // Example value, replace with actual data if available
          page_status: 'System', // Example value, replace with actual data if available
          page_comment: 'Page Not Found', // Example value, replace with actual data if available
          row_type: 'Pg-Row', // Example value, replace with actual data if available
          row_status: 'System', // Example value, replace with actual data if available
        })),
      );

      return {
        success: true,
        data: AllPagesData,
        columns,
        error: '',
        statusCode: 200,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: (error as Error).message,
        statusCode: 500,
      };
    }
  }
  /**
   * Finds Pg All In DataBase based on provided Pg ID.
   *
   * @param {number} Pg - The ID of the PG to find.
   * @returns {Promise<any>} The reponse of Pg type.
   */
  async getonePageData(Pg: number): Promise<any> {
    const page = await this.entityManager.findOne(Page, {
      where: { Pg },
      relations: ['rows', 'rows.ParentRow', 'rows.cells', 'rows.cells.CellCol'],
    });

    if (!page) {
      throw new Error('Page not found');
    }

    // const response = await this.cachePageResponse(page);
    const response = await this.cachePageResponseFromRawQuery(page);
    return response;
  }

  private async cachePageResponse(page: Page) {
    const Pg = Number(page.Pg);

    const cachedPage = await this.getPageFromCache(Pg.toString());

    if (cachedPage) {
      return JSON.parse(cachedPage);
    }

    const pageColumns = await this.getPageColumns(Pg);

    const orderedPageColumns = await this.getOrderedPageColumns(Pg, pageColumns);

    const rowsWithItems = await this.extractRowsWithItems(page.rows, pageColumns);

    const transformedData = this.transformData(rowsWithItems);

    const enrichData = await this.enrichData(transformedData);

    const response = {
      pageColumns: orderedPageColumns,
      pageData: enrichData,
    };

    const cacheKey = page.Pg.toString();
    const fileName = cacheKey + '.json';

    // TODO: We will remove the below lines, as these are using for cashing using JSON file
    // this.createJsonFile(fileName, response);
    // const parsedJsonFile = this.readJsonFile(fileName);
    // await this.cacheManager.set(cacheKey, JSON.stringify(parsedJsonFile), PAGE_CACHE.NEVER_EXPIRE);

    await this.cacheManager.set(cacheKey, JSON.stringify(response), PAGE_CACHE.NEVER_EXPIRE);

    return response;
  }

  private async cachePageResponseFromRawQuery(page: Page) {
    const Pg = Number(page.Pg);

    const pageColumns = await this.getPageColumnsFromRawQuery(Pg);

    const pageData = await this.getPageDataFromRawQuery(Pg)

    return {pageColumns, pageData};
  }

 

  private transformColDataForRawQuery(data: any) {
    const transformedData = [];

    Object.keys(data).forEach((key) => {
      const pageObject = {};
      let rowLevel: any[];
      let parentRow: any[];
      let colName: '';
      data[key].forEach((obj: any) => {
        // Capture the RowLevel value
        rowLevel = obj.RowLevel;
        parentRow = obj.ParentRow;

        const items = obj?.cellItems?.length == 1 ? obj.cellItems[0] : obj.cellItems;
        pageObject[obj.colName] = items
        // Object.keys(obj).forEach((col) => {
        //   if (col !== 'Col' && col !== 'Cell' && col !== 'RowLevel' && col !== 'ParentRow') {
        //     if (!pageObject[col]) {
        //       pageObject[col] = [];
        //     }
        //     //pageObject[col].push(...obj[col].map((item) => item));
        //   }
        // });
      });
      // Concatenate array values with semicolons and create the final page object
      const finalPageObject = {};
      Object.keys(pageObject).forEach((col) => {
        //finalPageObject[col] = pageObject[col].join(';');
      });
      
      finalPageObject['row'] = key;
      finalPageObject['RowLevel'] = rowLevel;
      finalPageObject['ParentRow'] = parentRow;
      transformedData.push(pageObject);
    });

    return transformedData;
  }










  

  private filterRecord(filterKey: string, filterValue: string, filterData: any[]) {
    const data = filterData
      .filter((data) => data[filterKey] == filterValue)
      .map(fData => fData.tItem_JSON);

    return data;

  }

  private async getAllCols() {
    const client = await this.pool.connect();
    const allColNamesQuery = `
      SELECT
        tItem."JSON" AS "tItem_JSON"
 
      FROM "tCell" tCell
      LEFT JOIN "tItem" tItem ON tItem."Item" = ANY(tCell."Items")
      LEFT JOIN "tRow" tRow ON tRow."Row" = tCell."Row"

	    WHERE tRow."Pg" = 1000000006
	    AND tCell."Col" = 2000000056
	    ORDER BY tRow."Row" ASC;
    `;

    const allColIdsQuery = `
      SELECT
        tItem."Object" AS "tItem_Object"
 
      FROM "tCell" tCell
      LEFT JOIN "tItem" tItem ON tItem."Item" = ANY(tCell."Items")
      LEFT JOIN "tRow" tRow ON tRow."Row" = tCell."Row"

	    WHERE tRow."Pg" = 1000000006
	    AND tCell."Col" = 2000000053
	    ORDER BY tRow."Row" ASC;
    `;

    const allColNames = (await client.query(allColNamesQuery)).rows;
    const allColIds = (await client.query(allColIdsQuery)).rows;

    const mergeCols = allColNames.reduce((acc, item, index) => {
      acc.push({
        colId: allColIds[index].tItem_Object,
        colName: item.tItem_JSON[3000000100]
      });
      
      return acc;
    }, []);  // Initialize as an array, not an object

    return mergeCols
  }

  private async getOrderedPageColumns(Pg: number, pageColumns: any[]): Promise<any[]> {
    // Retrieve the page format by column name
    const pageFormat = await this.formatService.findOneByColumnName('Object', Pg.toString());

    // Extract and clean the ordered column IDs from the format
    const orderedColumnIds = pageFormat.PgCols.toString()
      .replace(/[{}]/g, '')
      .split(',')
      .map((id) => id.trim());

    // Map through the orderedColumnIds to find and order the corresponding columns from pageColumns
    const orderedColumns = orderedColumnIds
      .map((orderedColId) => pageColumns.find((col: any) => col.col === orderedColId))
      .filter(Boolean); // Filter out any undefined values

    // Filter and collect columns that are hidden
    const hiddenColumns = pageColumns.filter((col) => col.status.includes('Hidden'));

    // Combine ordered columns with hidden columns
    return [...orderedColumns, ...hiddenColumns];
  }

  private createJsonFile(fileName: string, data: any) {
    const filePath = path.join(this.uploadPath, fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  private readJsonFile(fileName: string) {
    const filePath = path.join(this.uploadPath, fileName);
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent);
    } else {
      throw new Error('File not found');
    }
  }

  private async getPageFromCache(cacheKey: string) {
    const cache: string = await this.cacheManager.get(cacheKey);

    return cache ? cache : false;
  }

  public async clearPageCache(cacheKey: string) {
    await this.cacheManager.set(cacheKey, '');
    return 'Cache has been cleared for page ' + cacheKey;
  }

  private async extractRowsWithItems(rows: any[], pageColumns: any): Promise<Record<number, Array<any>>> {
    const rowsWithItems: Record<number, Array<{ Col: number; Cell: number; RowLevel: number; ParentRow: number }>> = {};

    for (const rowEl of rows) {
      const Row = rowEl.Row;
      if (!rowsWithItems[Row]) {
        rowsWithItems[Row] = [];
      }

      for (const cellEl of rowEl.cells) {
        const Cell = cellEl.Cell;
        const Col = cellEl.Col;
        const itemIds = await this.parseItemIds(cellEl.Items, cellEl);
        const Items = await this.getItemValues(itemIds);
        const field = this.getFieldByCol(Col, pageColumns);
        rowsWithItems[Row].push({
          Col,
          Cell,
          RowLevel: rowEl.RowLevel,
          ParentRow: rowEl.ParentRow,
          [field]: Items,
        });
      }
    }

    return rowsWithItems;
  }

  private async parseItemIds(items: string, cell: Cell): Promise<number[]> {
    if (items) {
      let cellItems = items
        .replace(/[{}]/g, '')
        .split(',')
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id));

      // Cell have more than one items, means it has an item order
      if (cellItems && cellItems.length > 1) {
        const cellFormat = await this.formatService.findOneByColumnName('Object', cell.Cell.toString());
        if (cellFormat) {
          cellItems = cellFormat?.CellItems?.toString()
            .replace(/[{}]/g, '')
            .split(',')
            .map((id) => parseInt(id.trim(), 10))
            .filter((id) => !isNaN(id));
        }
      }
      return cellItems ?? [];
    }
    return [];
  }

  private async enrichData(data: any[]): Promise<any[]> {
    const enrichedData = [];

    for (const record of data) {
      let enrichedRecord = { ...record };

      enrichedRecord = await this.enrichRecord(enrichedRecord, 'row', 'row');
      enrichedRecord = await this.enrichRecord(enrichedRecord, 'page_id', 'page');
      enrichedRecord = await this.enrichRecord(enrichedRecord, 'col_id', 'col');

      enrichedData.push(enrichedRecord);
    }

    return enrichedData;
  }

  private async enrichRecord(record: any, key: string, objectKey: string): Promise<any> {
    if (key in record && record[key]) {
      const format = await this.formatService.findOneByColumnName('Object', record[key]);
      const row = await this.rowService.findOne(record.row);
      let comment = null;
      let status = null;
      let rowType = null;
      let colFormula = null;
      let pageColOwner = null;
      if (format?.Comment) {
        for (const key in format?.Comment) {
          if (format?.Comment.hasOwnProperty(key)) {
            comment = format?.Comment[key];
            break; // want the first key-value pair
          }
        }
      }

      if (objectKey == 'page' || objectKey == 'col') {
        pageColOwner = 'Admin';
      }

      if (format?.Formula && objectKey == 'col') {
        for (const key in format?.Formula) {
          if (format?.Formula.hasOwnProperty(key)) {
            colFormula = format?.Formula[key];
            break; // want the first key-value pair
          }
        }
      }

      if (format && format?.Status) {
        const statuses = await Promise.all(
          format.Status.toString()
            .replace(/[{}]/g, '')
            .split(',')
            .map(async (status) => {
              return await this.getRowJson(Number(status));
            }),
        );
        status = statuses.join(';');
      }

      if (row?.RowType) {
        const rowTypes = await Promise.all(
          row.RowType.toString()
            .replace(/[{}]/g, '')
            .split(',')
            .map(async (type) => {
              return await this.getRowJson(Number(type));
            }),
        );
        rowType = rowTypes.join(';');
      }

      // row_commnet, row_status & row_type would be part of every page
      return {
        ...record,
        [`${objectKey}_comment`]: comment ?? null,
        [`${objectKey}_status`]: status ?? null,
        [`${objectKey}_owner`]: pageColOwner ?? null,
        [`row_type`]: rowType ?? null,
        ...(colFormula ? { [`col_formula`]: colFormula } : {}),
      };
    }

    return record;
  }

  private async extractStatusRowsWithItems(rows: any[]) {
    const rowsWithItems: any = [];

    for (const rowEl of rows) {
      const Row = rowEl.Row;

      if (!rowsWithItems[Row]) {
        rowsWithItems[Row] = [];
      }
      const statusRowsCell = await this.cellService.findOneByColumnName('Row', Row);
      return statusRowsCell;
    }

    return rowsWithItems;
  }

  async getItemValues(itemIds: number[]) {
    const items = await this.itemService.getItemsByIds(itemIds);

    // Use Promise.all to handle async operations in map
    const results = await Promise.all(
      items.map(async (item) => {
        if (item) {
            if (item && item.JSON) {
                // If JSON is not null, return the JSON object
                let jsonValue = null;
                for (const key in item.JSON) {
                  if (item.JSON.hasOwnProperty(key)) {
                    jsonValue = item.JSON[key];
                    break; // Assuming you want the first key-value pair
                  }
                }
                if (item.DataType.Row == ALL_DATATYPES.DropDownSource && jsonValue) {
                  jsonValue = await this.getItemsFromRowIds(jsonValue);
                }
                return jsonValue;
              } else if (item.DateTime) {
                return item.DateTime.toLocaleDateString();
              } else if (item.Num) {
                return item.Num;
              } else {
                const itemObject = item.ItemObject;
                //   const PageItemObject = item.PageObjectItem;
                if (itemObject) {
                  const cell = itemObject.cells[0];
                  if (cell && cell.Items) {
                    const objectItemIds = cell.Items.toString()
                      .replace(/[{}]/g, '')
                      .split(',')
                      .map((id) => parseInt(id.trim(), 10))
                      .filter((id) => !isNaN(id));
      
                    const objectItems = await this.itemService.getItemsByIds(objectItemIds);
                    return objectItems.map((objectItem) => {
                      if (objectItem.JSON) {
                        // If JSON is not null, return the JSON object
                        let ObjectJsonValue = null;
                        for (const key in objectItem.JSON) {
                          if (objectItem.JSON.hasOwnProperty(key)) {
                            ObjectJsonValue = objectItem.JSON[key];
                            break; // Assuming you want the first key-value pair
                          }
                        }
                        return ObjectJsonValue;
                      }
                    });
                  }
                }
                return item.Object;
              }
        }
        return null;
      }),
    );

    return results;
  }

  private async getItemsFromRowIds(ids: string) {
    const rowIds = ids.toString().split(';');

    const items = await Promise.all(
      rowIds.map(async (id) => {
        const rowId = Number(id);
        return (
          (await this.getRowJson(rowId)) ||
          (await this.getRowJson(rowId, SHEET_NAMES.ALL_LABELS)) ||
          (await this.getRowJson(rowId, SHEET_NAMES.ALL_UNITS)) ||
          (await this.getRowJson(rowId, SHEET_NAMES.ALL_SUPPLIERS)) ||
          (await this.getRowJson(rowId, SHEET_NAMES.ALL_TOKENS)) ||
          (await this.getRowJson(rowId, SHEET_NAMES.ALL_LANGUAGES)) ||
          (await this.getRowJson(rowId, SHEET_NAMES.ALL_REGIONS)) ||
          (await this.getRowJson(rowId, SHEET_NAMES.ALL_MODELS))
        );
      }),
    );

    return items.length > 0 ? items.join(';') : null;
  }

  // Function to get field value by passing the col value
  getFieldByCol(col: number, pageColumns: any): string | undefined {
    const columnFieldMap: Record<string, string> = {};
    for (const col of pageColumns) {
      columnFieldMap[col.col] = col.field;
    }
    return columnFieldMap[col];
  }

  transformData(data: any) {
    const transformedData = [];

    Object.keys(data).forEach((key) => {
      const pageObject = {};
      let rowLevel: any[];
      let parentRow: any[];
      data[key].forEach((obj: { [x: string]: any[] }) => {
        // Capture the RowLevel value
        rowLevel = obj.RowLevel;
        parentRow = obj.ParentRow;
        Object.keys(obj).forEach((col) => {
          if (col !== 'Col' && col !== 'Cell' && col !== 'RowLevel' && col !== 'ParentRow') {
            if (!pageObject[col]) {
              pageObject[col] = [];
            }
            pageObject[col].push(...obj[col].map((item) => item));
          }
        });
      });
      // Concatenate array values with semicolons and create the final page object
      const finalPageObject = {};
      Object.keys(pageObject).forEach((col) => {
        finalPageObject[col] = pageObject[col].join(';');
      });
      finalPageObject['row'] = key;
      finalPageObject['RowLevel'] = rowLevel;
      finalPageObject['ParentRow'] = parentRow;
      transformedData.push(finalPageObject);
    });

    return transformedData;
  }

  /**
   * Finds Pg Lables based on provided Pg ID.
   *
   * @param {number} pageId - The ID of the PG to find.
   * @returns {Promise<ApiResponse>} The reponse of Pg Cols.
   */
  async getOnePage(pageId: number): Promise<any> {
    try {
      // Fetch the page and Relations data from ROW, Cells, Columns, items
      const page = await this.entityManager.findOne(Page, {
        where: { Pg: pageId },
        relations: ['rows', 'rows.cells', 'rows.cells.CellCol'],
      });

      if (!page) {
        throw new Error('Page not found');
      }

      // Prepare containers for separate tables
      const rowsTable: any[] = [];
      const cellsTable: any[] = [];
      const columnsTable: any[] = [];
      const itemsTable: any[] = [];

      // Extract all item IDs and map row, cell, and column data
      const itemIdsSet = new Set<number>();
      for (const row of page.rows) {
        rowsTable.push({
          Row: row.Row,
          Inherit: row.Inherit,
          RowLevel: row.RowLevel,
          Page: page.Pg,
          Share: row.Row,
          ParentRow: row.Row,
          SiblingRow: row.Row,
        });

        for (const cell of row.cells) {
          cellsTable.push({
            Cell: cell.Cell,
            Col: cell.CellCol.Col,
            Row: cell.CellRow.Row,
            DataType: cell.DataType,
            DropDownSource: cell.DropDownSource,
            Items: cell.Items,
          });

          columnsTable.push({
            Col: cell.CellCol.Col,
          });

          if (cell.Items) {
            let itemsArray: number[] = [];
            if (typeof cell.Items === 'string') {
              // Add type assertion to help TypeScript infer correct type
              const itemsString = cell.Items as string;
              itemsArray = itemsString
                .replace(/[{}]/g, '')
                .split(',')
                .map((item) => parseInt(item.trim(), 10));
            } else if (Array.isArray(cell.Items)) {
              itemsArray = cell.Items as number[];
            }
            itemsArray.forEach((itemId) => itemIdsSet.add(itemId));
          }
        }
      }

      // Retrieve the complete records of each item ID
      const itemIds = Array.from(itemIdsSet);
      const items = await this.entityManager.findByIds(Item, itemIds);

      // Map item records to the items table
      items.forEach((item) => {
        itemsTable.push({
          Item: item.Item,
          Inherit: item.Inherit,
          Object: item.Object,
          SmallInt: item.SmallInt,
          BigInt: item.BigInt,
          Num: item.Num,
          Color: item.Color,
          DateTime: item.DateTime,
          JSON: item.JSON,
          Qty: item.Qty,
          StdQty: item.StdQty,
          Foreign: item.Foreign,
        });
      });

      // Construct the final response object
      const response = {
        success: true,
        data: {
          page: {
            Pg: page.Pg,
          },
          rows: rowsTable,
          cells: cellsTable,
          columns: columnsTable,
          items: itemsTable,
        },
        statusCode: 200,
      };

      return response;
    } catch (error) {
      console.error(error);
      return {
        success: false,
        error: (error as Error).message,
        statusCode: 500,
      };
    }
  }
  /**
   * Finds One Page Data with Relations with Row, Cell, Columns, Items based on provided Pg ID.
   *
   * @param {number} pageId - The ID of the PG to find.
   * @returns {Promise<ApiResponse>} The reponse of Pg Cols.
   */
  //get the page column ids
  async getPageColumnsids(pageId: number): Promise<{ column_names: any[] }> {
    const pgCols = await this.findPageColumns(pageId);

    const column_names = pgCols.map((col) => ({
      column_id: col.column_id,
      column_name: col.column_name,
    }));

    return { column_names };
  }
  // Add Page Record with Format record
  async createPageWithFormat(cols: number[]): Promise<{ createdPage: any; createdFormat: Format }> {
    // Step 1: Create the Page entity
    const createdPage = await this.createPage(cols); // Pass the cols to the createPage function

    // Step 2: Create the Format entity associated with the created Page
    const createdFormat = await this.formatService.createFormat({
      User: 3000000099 as any, // Assuming SYSTEM_INITIAL is defined somewhere in your code
      ObjectType: 3000000582 as any, // Assuming SYSTEM_INITIAL.ROW is the object type for a row
      Object: createdPage.Pg,
      PgCols: createdPage.Cols, // Save the cols into the PgCols[] field
    });

    // Step 3: Clear cache for the page
/*     const clean = await this.clearPageCache(createdPage.Pg.toString()); // Clear cache for this page
    console.log(clean); */
    // Return both created entities
    return { createdPage, createdFormat };
  }
  // Updating the page Columns Orders
  async updatePageColsOrder(Pg: number, PgCols: number[]) {
    const pgFormatRecord = await this.formatService.findOneByColumnName('Object', Pg);

    const updatedPgFormatRecord = await this.formatService.updateFormat(pgFormatRecord.Format, { PgCols });

    // Clear page cache after updating page column order
    await this.clearPageCache(Pg.toString());

    return updatedPgFormatRecord;
  }
  // get All Regions 
  async getRegions() {
    const data = await this.getonePageData(1000000013);
    const filteredregions = data?.pageData?.filter((el) => el.RowLevel === 1);
    const regions = filteredregions.map((el) => ({
      [el.row]: el.region,
    }));
    await this.cacheManager.set('regions', JSON.stringify(regions), PAGE_CACHE.NEVER_EXPIRE);
    return { regions };
  }
  // Get All the languages
  async getLanguages(pageId: number): Promise<any> {
    // Step 1: Create a cache key
    const cacheKey = pageId.toString();

    // Step 2: Try to get cached data
    const cachedResponse = await this.cacheManager.get(cacheKey) as string;
    if (cachedResponse) {
      return JSON.parse(cachedResponse);
    }

    // Step 3: Fetch the page data along with its associated rows and cells based on the given pageId
    const page = await this.entityManager.findOne(Page, {
      where: { Pg: pageId },
      relations: ['rows', 'rows.cells'], // Fetch rows and their associated cells
    });

    // Step 4: If no page is found, throw an error
    if (!page) {
      throw new Error('Page not found');
    }

    // Step 5: Initialize the response structure for storing languages data
    const response: { "ALL Languages": { [key: string]: string }[] } = {
      "ALL Languages": [],
    };

    // Step 6: Loop through each row in the fetched page
    for (const row of page.rows) {
      // Step 7: Loop through each cell in the current row
      for (const cell of row.cells) {
        // Step 8: Check if the cell contains items (which are IDs)
        if (cell.Items) {
          let itemsArray: number[] = [];

          // Step 9: Parse the Items if they are in string format or assign them directly if they are already an array
          if (typeof cell.Items === 'string') {
            // Convert the string of item IDs into an array of numbers
            itemsArray = (cell.Items as string)
              .replace(/[{}]/g, '') // Remove curly braces
              .split(',')            // Split the string by commas
              .map((item) => parseInt(item.trim(), 10)); // Convert each item to a number
          } else if (Array.isArray(cell.Items)) {
            itemsArray = cell.Items; // Use the array as is
          }

          // Step 10: Fetch the item records from the database by their IDs
          const items = await this.entityManager.findByIds(Item, itemsArray);

          // Step 11: Loop through the retrieved items and extract their JSON language data
          items.forEach((item) => {
            if (item.JSON) {
              // Step 12: Loop through each key-value pair in the item's JSON object
              for (const [jsonKey, languageName] of Object.entries(item.JSON)) {
                // Step 13: Check if the language name is not "All Languages" and add it to the response
                if (languageName !== "All Languages") {
                  response["ALL Languages"].push({
                    [row.Row.toString()]: languageName as string, // Row ID as key, language name as value
                  });
                }
              }
            }
          });
        }
      }
    }

    // Step 14: Sort the response alphanumerically based on the Row ID (key)
    response["ALL Languages"].sort((a, b) => {
      const keyA = Object.keys(a)[0];
      const keyB = Object.keys(b)[0];
      return keyA.localeCompare(keyB, undefined, { numeric: true, sensitivity: 'base' });
    });

    // Step 15: Cache the sorted response
    await this.cacheManager.set(cacheKey, JSON.stringify(response), PAGE_CACHE.NEVER_EXPIRE);

    // Step 16: Return the final sorted response
    return response;
  }
  // Get All The DDS Types  
  async getDDS(payload: any): Promise<any> {
    const pageId = 1000000009; // Token Page ID

    // Step 1: Create a cache key
    const cacheKey = pageId.toString();

    // Step 2: Try to get cached data
    const cachedResponse = await this.cacheManager.get(cacheKey) as string;
    if (cachedResponse) {
      return JSON.parse(cachedResponse); // Return cached response if found
    }

    // Step 3: Retrieve all token data from the specified page ID (Database)
    const data = await this.getonePageData(pageId);

    // Step 4: Filter the data by matching the DDS value with the token field
    const ddsValue = payload.DDS;  // Expecting DDS in the payload
    const pageTypeData = data?.pageData?.find((el) => el.token === ddsValue);

    if (!pageTypeData) {
      // Return an empty array if no match for DDS
      return { DDS: [] };
    }

    const pageTypeRow = pageTypeData.row; // Get the row for the matching DDS (Page Type)

    // Step 5: Filter the data to find all rows that have ParentRow matching the pageTypeRow
    const filteredData = data?.pageData?.filter((el) => el.ParentRow?.Row === pageTypeRow);

    // Step 6: Map the result to the desired format with row as the key and token as the value
    const DDS = filteredData.map((el) => ({
      [el.row]: el.token,
    }));

    // Step 7: Include the Page Type itself in the result
    DDS.unshift({ [pageTypeRow]: pageTypeData.token });

    // Step 8: Cache the response for future use
    await this.cacheManager.set(cacheKey, JSON.stringify(DDS), PAGE_CACHE.NEVER_EXPIRE);


    // Return the final result
    return { DDS };
  }
}
