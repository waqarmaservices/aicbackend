import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { Page } from './page.entity';
import { Item } from 'modules/item/item.entity';
import { Cell } from 'modules/cell/cell.entity';
import { CellService } from 'modules/cell/cell.service';
import { RowService } from 'modules/row/row.service';
import { COLUMN_IDS, GENERAL, SYSTEM_INITIAL, TOKEN_IDS, TOKEN_NAMES } from '../../constants';
import { ApiResponse } from 'common/dtos/api-response.dto';
import { ColService } from 'modules/col/col.service';
import { ItemService } from 'modules/item/item.service';
import { Format } from 'modules/format/format.entity';
import { FormatService } from 'modules/format/format.service';

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
    private readonly colService: ColService,
    private readonly itemService: ItemService,
    private readonly formatService: FormatService,
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

  async getPageColumns(pageId: number): Promise<ApiResponse<any>> {
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
        title: col.column_name.trim(),
        field: this.transformColName(col.column_name),
        status: colStatuses,
      });
    }
    return pgColResponse;
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
    console.log('Col Status IDS', colStatuses);
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

      const colNameCellItems = await this.getItemsByJson(colNameCells);
      const colIdCellItems = await this.getItemsByObject(colIdCells);

      const columns = colIdCellItems.map((colId, index) => {
        return {
          column_id: colId,
          column_name: colNameCellItems[index],
        };
      });

      return columns;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  async findPageType(pageId: number): Promise<any> {
    const pageTypeColId = COLUMN_IDS.ALL_PAGES.PAGE_TYPE; // Col-ID of Column 'Page Type'
    const pgRow = await this.rowService.findOneByColumnName('Pg', pageId);

    if (pgRow) {
      const itemId = await this.entityManager
        .findOne(Cell, {
          where: {
            Row: pgRow.Row,
            Col: pageTypeColId,
          },
        })
        .then((cell) => (cell ? cell.Items.toString().replace(/[{}]/g, '') : null));

      if (itemId) {
        const cellItem = await this.entityManager.findOne(Item, {
          where: { Item: Number(itemId) },
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
  private async getRowJson(rowId: number): Promise<string> {
    const row = await this.rowService.findOne(rowId);
    const cell = await this.entityManager.findOne(Cell, {
      where: {
        Row: row.Row,
        Col: COLUMN_IDS.ALL_TOKENS.TOKEN,
      },
    });
    if (cell) {
      const itemId = cell.Items.toString().replace(/[{}]/g, '');
      const item = await this.entityManager.findOne(Item, {
        where: { Item: Number(itemId) },
      });

      return item.JSON[SYSTEM_INITIAL.ENGLISH];
    }

    return null;
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
        const pageName = page.PageName || 'All Pages'; // Adjust if your Page entity has a different property for the name

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
                  item.JSON = {
                    ...item.JSON,
                    [page.Pg]: pageName,
                  };
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
          page_name: page.PageName || 'All Pages', // Use actual page name
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
      relations: ['rows', 'rows.cells', 'rows.cells.CellCol'],
    });

    if (!page) {
      throw new Error('Page not found');
    }

    const pageColumns = await this.getPageColumns(Pg);

    const rowsWithItems = await this.extractRowsWithItems(page.rows, pageColumns);

    const transformedData = this.transformData(rowsWithItems);

    const enrichData = await this.enrichData(transformedData);
    return {
      pageColumns: pageColumns,
      pageData: enrichData,
    };
  }

  private async extractRowsWithItems(rows: any[], pageColumns: any): Promise<Record<number, Array<any>>> {
    const rowsWithItems: Record<number, Array<{ Col: number; Cell: number; RowLevel: number }>> = {};

    for (const rowEl of rows) {
      const Row = rowEl.Row;
      if (!rowsWithItems[Row]) {
        rowsWithItems[Row] = [];
      }

      for (const cellEl of rowEl.cells) {
        const Cell = cellEl.Cell;
        const Col = cellEl.Col;
        const itemIds = this.parseItemIds(cellEl.Items);
        const Items = await this.getItemValues(itemIds);
        const field = this.getFieldByCol(Col, pageColumns);
        rowsWithItems[Row].push({
          Col,
          Cell,
          RowLevel: rowEl.RowLevel,
          [field]: Items,
        });
      }
    }

    return rowsWithItems;
  }

  private parseItemIds(items: string): number[] {
    return items
      .replace(/[{}]/g, '')
      .split(',')
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id));
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
      let comment = null;
      let status = null;
      if (format?.Comment) {
        for (const key in format?.Comment) {
          if (format?.Comment.hasOwnProperty(key)) {
            comment = format?.Comment[key];
            break; // want the first key-value pair
          }
        }
      }
      if (format.Status) {
        status = format.Status;
      }
      return {
        ...record,
        [`${objectKey}_comment`]: comment ?? null,
        [`${objectKey}_status`]: status ?? null,
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
        if (item.JSON) {
          // If JSON is not null, return the JSON object
          let jsonValue = null;
          for (const key in item.JSON) {
            if (item.JSON.hasOwnProperty(key)) {
              jsonValue = item.JSON[key];
              break; // Assuming you want the first key-value pair
            }
          }
          return jsonValue;
        } else if (item.DateTime) {
          return item.DateTime;
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
      }),
    );

    return results;
  }

  // Function to get field value by passing the col value
  getFieldByCol(col: number, pageColumns: any): string | undefined {
    const columnFieldMap: Record<string, string> = {};
    for (const col of pageColumns) {
      columnFieldMap[col.col] = col.field;
    }
    return columnFieldMap[col];
  }

  transformData(data) {
    const transformedData = [];

    Object.keys(data).forEach((key) => {
      const pageObject = {};
      let rowLevel: any[];
      data[key].forEach((obj: { [x: string]: any[] }) => {
        // Capture the RowLevel value
        rowLevel = obj.RowLevel;
        Object.keys(obj).forEach((col) => {
          if (col !== 'Col' && col !== 'Cell' && col !== 'RowLevel') {
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
      transformedData.push(finalPageObject);
    });

    return transformedData;
  }

  /**
   * Finds Pg All Data based on provided Pg ID.
   *
   * @param {number} pageId - The ID of the PG to find.
   * @returns {Promise<ApiResponse>} The reponse of Pg Cols.
   */
  async getOneCollPageData(pageId: number): Promise<any> {
    try {
      const page = await this.entityManager.findOne(Page, {
        where: { Pg: pageId },
        relations: ['rows', 'rows.cells', 'rows.cells.CellCol'],
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

      // Extract column data from each cell in the page
      const oneCollPageData = page.rows.flatMap((row) =>
        row.cells.map((cell) => ({
          row_id: row.Row,
          col_id: cell.CellCol.Col,
          page_type: 'Each Page',
          page_id: page.Pg,
          col_name: 'colname', // Replace with actual data if available
          col_data_type: 'cell.CellCol.DataType ' || 'N/A', // Replace with actual data if available
          col_dropdown_source: 'cell.CellCol.DropdownSource' || 'N/A', // Replace with actual data if available
          col_formula: 'cell.CellCol.Formula' || 'N/A', // Replace with actual data if available
          col_status: 'cell.CellCol.Status' || 'N/A', // Replace with actual data if available
          col_owner: 'Admin', // Example value, replace with actual data if available
          col_comment: 'Page Not Found', // Replace with actual data if available
          row_type: 'col-row', // Example value, replace with actual data if available
          row_status: 'system', // Example value, replace with actual data if available
        })),
      );

      // Columns definition
      const columns = [
        { title: 'Row ID', field: 'row_id', frozen: true, tooltip: true, width: 'auto', editor: false },
        { title: 'Col ID', field: 'col_id', frozen: true, width: 'auto', tooltip: true, editor: false },
        { title: 'Page Type', field: 'page_type', width: 'auto', editor: false, tooltip: true },
        { title: 'Page ID', field: 'page_id', tooltip: true, width: 'auto', editor: false },
        { title: 'Col Name', field: 'col_name', tooltip: true, width: 'auto', editor: false },
        { title: 'Col Data Type', field: 'col_data_type', tooltip: true, width: 'auto', editor: false },
        { title: 'Col Dropdown Source', field: 'col_dropdown_source', tooltip: true, width: 'auto', editor: false },
        { title: 'Col Formula', field: 'col_formula', tooltip: true, width: 'auto', editor: false },
        { title: 'Col Status', field: 'col_status', tooltip: true, width: 'auto', editor: false },
        { title: 'Col Owner', field: 'col_owner', tooltip: true, width: 'auto', editor: false },
        { title: 'Col Comment', field: 'col_comment', tooltip: true, width: 'auto', editor: false },
        { title: 'Row Type', field: 'row_type', tooltip: true, width: 'auto', editor: false },
        { title: 'Row Status', field: 'row_status', tooltip: true, width: 'auto', editor: false },
      ];

      return {
        success: true,
        data: oneCollPageData,
        columns,
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
   * Finds Pg Collumns based on provided Pg ID.
   *
   * @param {number} pageId - The ID of the PG to find.
   * @returns {Promise<ApiResponse>} The reponse of Pg Cols.
   */
  async getOnePageAllTokens(pageId: number): Promise<any> {
    try {
      const page = await this.entityManager.findOne(Page, {
        where: { Pg: pageId },
        relations: ['rows', 'rows.cells', 'rows.cells.CellCol'],
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

      // Transform the page data into the required token format
      const tokenData = page.rows.map((row) => ({
        row_id: row.Row,
        token: 'ALL Token', // Fixed value
        row_type: 'node', // Fixed value
        row_status: 'section Head', // Fixed value
        row_comment: 'Page Not Found', // Fixed value
      }));

      // Columns definition
      const columns = [
        { title: 'Row ID', field: 'row_id', frozen: true, tooltip: true, width: 'auto', editor: false },
        { title: 'Token', field: 'token', width: 'auto', editor: false, tooltip: true },
        { title: 'Row Type', field: 'row_type', tooltip: true, width: 'auto', editor: false },
        { title: 'Row Status', field: 'row_status', tooltip: true, width: 'auto', editor: false },
        { title: 'Row Comment', field: 'row_comment', tooltip: true, width: 'auto', editor: false },
      ];

      return {
        success: true,
        data: tokenData,
        columns,
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
   * Finds Pg Tokens based on provided Pg ID.
   *
   * @param {number} pageId - The ID of the PG to find.
   * @returns {Promise<ApiResponse>} The reponse of Pg Cols.
   */
  async getOnePageAlllanguages(pageId: number): Promise<any> {
    try {
      const page = await this.entityManager.findOne(Page, {
        where: { Pg: pageId },
        relations: ['rows', 'rows.cells', 'rows.cells.CellCol'],
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

      // Transform the page data into the required token format
      const languagesData = page.rows.map((row) => ({
        row_id: row.Row,
        language: 'ALL language', // Fixed value
        row_type: 'Default', // Fixed value
        row_status: 'Section-Head', // Fixed value
        row_comment: 'Page Not Found', // Fixed value
      }));

      // Columns definition
      const columns = [
        { title: 'Row ID', field: 'row_id', frozen: true, tooltip: true, width: 'auto', editor: false },
        { title: 'Language', field: 'language', width: 'auto', editor: false, tooltip: true },
        { title: 'Row Type', field: 'row_type', tooltip: true, width: 'auto', editor: false },
        { title: 'Row Status', field: 'row_status', tooltip: true, width: 'auto', editor: false },
        { title: 'Row Comment', field: 'row_comment', tooltip: true, width: 'auto', editor: false },
      ];

      return {
        success: true,
        data: languagesData,
        columns,
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
   * Finds Pg languages based on provided Pg ID.
   *
   * @param {number} pageId - The ID of the PG to find.
   * @returns {Promise<ApiResponse>} The reponse of Pg Cols.
   */
  async getOnePageAllregions(pageId: number): Promise<any> {
    try {
      const page = await this.entityManager.findOne(Page, {
        where: { Pg: pageId },
        relations: ['rows', 'rows.cells', 'rows.cells.CellCol'],
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

      // Transform the page data into the required token format
      const regionsData = page.rows.map((row) => ({
        region: 'ALL Regions',
        row_type: 'Country', // Fixed value
        row_status: 'Section-Head', // Fixed value
        row_comment: 'Page Not Found', // Fixed value
      }));

      // Columns definition
      const columns = [
        { title: 'Region', field: 'region', frozen: true, tooltip: true, width: 'auto', editor: false },
        { title: 'Row Type', field: 'row_type', tooltip: true, width: 'auto', editor: false },
        { title: 'Row Status', field: 'row_status', tooltip: true, width: 'auto', editor: false },
        { title: 'Row Comment', field: 'row_comment', tooltip: true, width: 'auto', editor: false },
      ];

      return {
        success: true,
        data: regionsData,
        columns,
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
   * Finds Pg regions based on provided Pg ID.
   *
   * @param {number} pageId - The ID of the PG to find.
   * @returns {Promise<ApiResponse>} The reponse of Pg Cols.
   */
  async getOnePageAllsupplier(pageId: number): Promise<any> {
    try {
      const page = await this.entityManager.findOne(Page, {
        where: { Pg: pageId },
        relations: ['rows', 'rows.cells', 'rows.cells.CellCol'],
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

      // Transform the page data into the required token format
      const supplierData = page.rows.map((row) => ({
        supplier: 'ALL Supplier',
        row_type: 'Company', // Fixed value
        row_status: 'Section-Head', // Fixed value
        row_comment: 'Page Not Found', // Fixed value
      }));

      // Columns definition
      const columns = [
        { title: 'Supplier', field: 'supplier', frozen: true, tooltip: true, width: 'auto', editor: false },
        { title: 'Row Type', field: 'row_type', tooltip: true, width: 'auto', editor: false },
        { title: 'Row Status', field: 'row_status', tooltip: true, width: 'auto', editor: false },
        { title: 'Row Comment', field: 'row_comment', tooltip: true, width: 'auto', editor: false },
      ];

      return {
        success: true,
        data: supplierData,
        columns,
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
   * Finds Pg supplier based on provided Pg ID.
   *
   * @param {number} pageId - The ID of the PG to find.
   * @returns {Promise<ApiResponse>} The reponse of Pg Cols.
   */
  async getOnePageAllmodels(pageId: number): Promise<any> {
    try {
      const page = await this.entityManager.findOne(Page, {
        where: { Pg: pageId },
        relations: ['rows', 'rows.cells', 'rows.cells.CellCol'],
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

      // Transform the page data into the required token format
      const supplierData = page.rows.map((row) => ({
        model: 'ALL Models',
        release_date: 'Roz e Qyamat',
        row_type: 'Company', // Fixed value
        row_status: 'Section-Head', // Fixed value
        row_comment: 'Page Not Found', // Fixed value
      }));

      // Columns definition
      const columns = [
        { title: 'Supplier', field: 'supplier', frozen: true, tooltip: true, width: 'auto', editor: false },
        { title: 'Release Date', field: 'release_date', tooltip: true, width: 'auto', editor: false },
        { title: 'Row Type', field: 'row_type', tooltip: true, width: 'auto', editor: false },
        { title: 'Row Status', field: 'row_status', tooltip: true, width: 'auto', editor: false },
        { title: 'Row Comment', field: 'row_comment', tooltip: true, width: 'auto', editor: false },
      ];

      return {
        success: true,
        data: supplierData,
        columns,
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
   * Finds Pg Models based on provided Pg ID.
   *
   * @param {number} pageId - The ID of the PG to find.
   * @returns {Promise<ApiResponse>} The reponse of Pg Cols.
   */
  async getOnePageAllunits(pageId: number): Promise<any> {
    try {
      const page = await this.entityManager.findOne(Page, {
        where: { Pg: pageId },
        relations: ['rows', 'rows.cells', 'rows.cells.CellCol'],
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

      // Transform the page data into the required token format
      const supplierData = page.rows.map((row) => ({
        unit: 'ALL Units',
        unit_factor: '001',
        row_type: 'Company', // Fixed value
        row_status: 'Section-Head', // Fixed value
        row_comment: 'Page Not Found', // Fixed value
      }));

      // Columns definition
      const columns = [
        { title: 'Supplier', field: 'supplier', frozen: true, tooltip: true, width: 'auto', editor: false },
        { title: 'Unit Factor', field: 'unit_factor', tooltip: true, width: 'auto', editor: false },
        { title: 'Row Type', field: 'row_type', tooltip: true, width: 'auto', editor: false },
        { title: 'Row Status', field: 'row_status', tooltip: true, width: 'auto', editor: false },
        { title: 'Row Comment', field: 'row_comment', tooltip: true, width: 'auto', editor: false },
      ];

      return {
        success: true,
        data: supplierData,
        columns,
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
   * Finds Pg units based on provided Pg ID.
   *
   * @param {number} pageId - The ID of the PG to find.
   * @returns {Promise<ApiResponse>} The reponse of Pg Cols.
   */
  async getOnePageAlllabes(pageId: number): Promise<any> {
    try {
      const page = await this.entityManager.findOne(Page, {
        where: { Pg: pageId },
        relations: ['rows', 'rows.cells', 'rows.cells.CellCol'],
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

      // Transform the page data into the required token format
      const LabelsData = page.rows.map((row) => ({
        row_id: '3000001001',
        lables: 'All Labels',
        value_data_type: 'CategoryID',
        value_dropdownsource: 'All Suppliers',
        value_defaultdata: 'Consumer',
        value_status: 'Section-Head; System',
        value_formula: '= [User Type].[Value]+',
        row_type: 'Company', // Fixed value
        row_status: 'Section-Head', // Fixed value
        row_comment: 'Page Not Found', // Fixed value
      }));

      // Columns definition
      const columns = [
        { title: 'Row', field: 'row_id', frozen: true, tooltip: true, width: 'auto', editor: false },
        { title: 'Lables', field: 'lables', tooltip: true, width: 'auto', editor: false },
        { title: 'Value DataType', field: 'value_data_type', tooltip: true, width: 'auto', editor: false },
        { title: 'Value DropDownSource', field: 'value_dropdownsource', tooltip: true, width: 'auto', editor: false },
        { title: 'Value DefaultData', field: 'value_defaultdata', tooltip: true, width: 'auto', editor: false },
        { title: 'Value Status', field: 'value_status', frozen: true, tooltip: true, width: 'auto', editor: false },
        { title: 'Value Formula', field: 'value_formula', tooltip: true, width: 'auto', editor: false },
        { title: 'Row Type', field: 'row_type', tooltip: true, width: 'auto', editor: false },
        { title: 'Row Status', field: 'row_status', tooltip: true, width: 'auto', editor: false },
        { title: 'Row Comment', field: 'row_comment', tooltip: true, width: 'auto', editor: false },
      ];

      return {
        success: true,
        data: LabelsData,
        columns,
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
}
