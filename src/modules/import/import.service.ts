import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PageService } from '../page/page.service';
import { RowService } from '../row/row.service';
import { ColService } from '../col/col.service';
import { CellService } from '../cell/cell.service';
import { ItemService } from '../item/item.service';
import { FormatService } from '../format/format.service';
import { UserService } from '../user/user.service';
import {
  SYSTEM_INITIAL,
  COLUMN_NAMES,
  SHEET_NAMES,
  SHEET_READ_OPTIONS,
  SECTION_HEAD,
  TOKEN_NAMES,
  COLUMN_IDS,
  PAGE_IDS,
} from '../../constants';

@Injectable()
export class ImportService {
  constructor(
    private readonly pageService: PageService,
    private readonly rowService: RowService,
    private readonly colService: ColService,
    private readonly cellService: CellService,
    private readonly itemService: ItemService,
    private readonly formatService: FormatService,
    private readonly userService: UserService,
  ) {}

  /**
   * Imports sheet data from a specified file.
   *
   * @param {string} filePath - The path to the file containing the sheet data.
   * @returns {Promise<string>} - A promise that resolves to a success message upon completion.
   */
  async importSheet(filePath: string): Promise<string> {
    // Read sheet data for all pages
    const { sheetData: allPagesSheetData, sheetColumns: allPagesSheetColumns } = this.readSheetData(
      filePath,
      SHEET_NAMES.ALL_PAGES,
      SHEET_READ_OPTIONS.ALL_PAGES,
    );
    // Read sheet data for all columns
    const { sheetData: allColsSheetData, sheetColumns: allColsSheetColumns } = this.readSheetData(
      filePath,
      SHEET_NAMES.ALL_COLS,
      SHEET_READ_OPTIONS.ALL_COLS,
    );
    // Read sheet data for all tokens
    const { sheetData: allTokensSheetData } = this.readSheetData(
      filePath,
      SHEET_NAMES.ALL_TOKENS,
      SHEET_READ_OPTIONS.ALL_TOKENS,
    );
    // Read sheet data for all languages
    const { sheetData: allLanguagesSheetData, sheetColumns: allLanguagesSheetColumns } = this.readSheetData(
      filePath,
      SHEET_NAMES.ALL_LANGUAGES,
      SHEET_READ_OPTIONS.ALL_LANGUAGES,
    );
    // Read sheet data for all regions
    const { sheetData: allRegionsSheetData } = this.readSheetData(
      filePath,
      SHEET_NAMES.ALL_REGIONS,
      SHEET_READ_OPTIONS.ALL_REGIONS,
    );
    // Read sheet data for all suppliers
    const { sheetData: allSuppliersSheetData } = this.readSheetData(
      filePath,
      SHEET_NAMES.ALL_SUPPLIERS,
      SHEET_READ_OPTIONS.ALL_SUPPLIERS,
    );
    // Read sheet data for all models
    const { sheetData: allModelsSheetData } = this.readSheetData(
      filePath,
      SHEET_NAMES.ALL_MODELS,
      SHEET_READ_OPTIONS.ALL_MODELS,
    );
    // Read sheet data for all units
    const { sheetData: allUnitsSheetData } = this.readSheetData(
      filePath,
      SHEET_NAMES.ALL_UNITS,
      SHEET_READ_OPTIONS.ALL_UNITS,
    );
    // Read sheet data for all labels
    const { sheetData: allLabelsSheetData } = this.readSheetData(
      filePath,
      SHEET_NAMES.ALL_LABELS,
      SHEET_READ_OPTIONS.ALL_LABELS,
    );

    // Extract page IDs and insert into the database
    const pageIds = this.extractColHeaderValue(allPagesSheetData, 1);
    await this.insertRecordIntotPG(pageIds);

    // Extract col IDs and insert into the database
    const colIds = this.extractColHeaderValue(allColsSheetData, 2);
    await this.insertRecordIntotCol(colIds);

    // Insert all tokens sheet data into the database
    await this.insertAllTokensData(allTokensSheetData);

    // Insert all pages sheet data into the database
    await this.insertAllPagesSheetData(allPagesSheetData, allPagesSheetColumns);

    // Insert all cols sheet data into the database
    await this.insertAllColsSheetData(allColsSheetData, allColsSheetColumns);

    // Insert all languages sheet data into the database
    await this.insertAllLanguagesSheetData(allLanguagesSheetData, allLanguagesSheetColumns);

    // Insert all regions sheet data into the database
    await this.insertAllRegionsSheetData(allRegionsSheetData);

    // Insert all suppliers sheet data into the database
    await this.insertAllSuppliersSheetData(allSuppliersSheetData);

    // Insert all models sheet data into the database
    await this.insertAllModelsSheetData(allModelsSheetData);

    // Insert all units sheet data into the database
    await this.insertAllUnitsSheetData(allUnitsSheetData);

    // Insert all labels sheet data into the database
    await this.insertAllLabelsSheetData(allLabelsSheetData);

    // Populate sibling rows
    await this.populateSiblingRowColumn();

    // Populate parent rows
    await this.populateParentRowColumn();

    return 'Data Imported Successfully!';
  }

  /**
   * Inserts page records into the database.
   *
   * @param {string[]} pageIds - An array of page IDs to be inserted.
   * @returns {Promise<void>} - A promise that resolves when the insertion is complete.
   */
  private async insertRecordIntotPG(pageIds: string[]): Promise<void> {
    for (const {} of pageIds) {
      // Create a new tPg record for each page ID
      await this.pageService.createPage();
    }
  }

  /**
   * Inserts col records into the database.
   *
   * @param {string[]} colIds - An array of col IDs to be inserted.
   * @returns {Promise<void>} - A promise that resolves when the insertion is complete.
   */
  private async insertRecordIntotCol(colIds: string[]): Promise<void> {
    for (const {} of colIds) {
      // Create a new col record for each col ID
      await this.colService.createCol();
    }
  }

  /**
   * Inserts all pages sheet data into the database.
   *
   * This function processes the sheet data and inserts each page's data into various
   * related tables in the database. It includes creating page records, row records,
   * and associated cells for different attributes.
   *
   * @param {any[]} sheetData - The raw sheet data to be processed.
   * @param {string[]} sheetColumns - The column names of the sheet data.
   * @returns {Promise<void>} - A promise that resolves when the insertion is complete.
   */
  private async insertAllPagesSheetData(sheetData: any[], sheetColumns: string[]): Promise<void> {
    // Process and normalize the sheet data
    const pagesData = await this.processSheetData(sheetData, sheetColumns);

    // Iterate through each processed page element
    for (const pageEl of pagesData) {
      // Find the page by its ID
      const page = await this.pageService.findOne(pageEl.Page_ID);

      // Retrieve row IDs for different Token IDs
      const pageIdRowId = await this.getRowId('JSON', TOKEN_NAMES.PageID);
      const dataTypeRowId = await this.getRowId('JSON', TOKEN_NAMES.RowID);
      const systemRowId = await this.getRowId('JSON', TOKEN_NAMES.System);
      const mlTextRowId = await this.getRowId('JSON', TOKEN_NAMES.MLText);
      const dropDownRowId = await this.getRowId('JSON', TOKEN_NAMES.DropDown);
      const urlRowId = await this.getRowId('JSON', TOKEN_NAMES.URL);
      const pgRowId = await this.getRowId('JSON', TOKEN_NAMES.PgRow);

      // Create a new tRow record for the page
      const createdRow = await this.rowService.createRow({
        Row: pageEl.Row,
        Pg: PAGE_IDS.ALL_PAGES,
        RowLevel: 1,
      });

      // Retrieve the last inserted user record
      const user = await this.userService.getLastInsertedRecord();

      // Process the page status to get status Token IDs
      const statuses = await this.processStatus(pageEl, 'Page_Status');

      // Create a tFormat for the page
      await this.formatService.createFormat({
        User: user.User,
        ObjectType: pageIdRowId,
        Object: page.Pg,
        Status: statuses,
        Comment: pageEl.Page_Comment ? { [SYSTEM_INITIAL.ENGLISH]: pageEl.Page_Comment } : null,
      });

      // Create a tFormat for the row
      await this.formatService.createFormat({
        User: user.User,
        ObjectType: dataTypeRowId,
        Object: createdRow.Row,
        Owner: user.User,
        Status: [systemRowId.Row],
      });

      // Check and insert page ID
      if (COLUMN_NAMES.Page_ID in pageEl) {
        const createdItem = await this.itemService.createItem({
          DataType: pageIdRowId,
          Object: page.Pg,
        });
        await this.cellService.createCell({
          Col: COLUMN_IDS.ALL_PAGES.PAGE_ID,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }

      // Check and insert page name
      if (COLUMN_NAMES.Page_Name in pageEl) {
        const createdItem = await this.itemService.createItem({
          DataType: mlTextRowId,
          JSON: { 3000000100: pageEl.Page_Name },
        });
        await this.cellService.createCell({
          Col: COLUMN_IDS.ALL_PAGES.PAGE_NAME,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }

      // Check and insert page type
      if (COLUMN_NAMES.Page_Type in pageEl && COLUMN_NAMES.Page_Type != null) {
        const objectRowId = await this.getRowId('JSON', pageEl.Page_Type);
        if (objectRowId) {
          const createdItem = await this.itemService.createItem({
            DataType: dropDownRowId,
            Object: objectRowId.Row,
          });
          await this.cellService.createCell({
            Col: COLUMN_IDS.ALL_PAGES.PAGE_TYPE,
            Row: createdRow.Row,
            Items: [createdItem.Item],
          });
        }
      }

      // Check and insert page edition
      if (COLUMN_NAMES.Page_Edition in pageEl) {
        const objectRowId = await this.getRowId('JSON', pageEl.Page_Edition);
        const createdItem = await this.itemService.createItem({
          DataType: dropDownRowId,
          Object: objectRowId.Row,
        });
        await this.cellService.createCell({
          Col: COLUMN_IDS.ALL_PAGES.PAGE_EDITION,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }

      // Check and insert page URL
      if (COLUMN_NAMES.Page_URL in pageEl) {
        const createdItem = await this.itemService.createItem({
          DataType: urlRowId,
          JSON: {
            3000000397: `https://aic.com/${page.Pg}/${this.createSlug(pageEl.Page_Name)}`,
          },
        });
        await this.cellService.createCell({
          Col: COLUMN_IDS.ALL_PAGES.PAGE_URL,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }

      // Check and insert page SEO
      if (COLUMN_NAMES.Page_SEO in pageEl) {
        if (this.isSemicolonSeparated(pageEl.Page_SEO)) {
          const seos = pageEl.Page_SEO.split(';');
          const itemIds = [];
          for (const seo of seos) {
            const createdItem = await this.itemService.createItem({
              DataType: mlTextRowId,
              JSON: { [SYSTEM_INITIAL.ENGLISH]: seo },
            });
            itemIds.push(createdItem.Item);
          }
          await this.cellService.createCell({
            Col: COLUMN_IDS.ALL_PAGES.PAGE_SEO,
            Row: createdRow.Row,
            Items: itemIds,
          });
        } else {
          const createdItem = await this.itemService.createItem({
            DataType: mlTextRowId,
            JSON: { [SYSTEM_INITIAL.ENGLISH]: pageEl.Page_SEO },
          });
          await this.cellService.createCell({
            Col: COLUMN_IDS.ALL_PAGES.PAGE_SEO,
            Row: createdRow.Row,
            Items: [createdItem.Item],
          });
        }
      }

      // Check and insert row type
      if (COLUMN_NAMES.Row_Type in pageEl) {
        const createdItem = await this.itemService.createItem({
          DataType: dropDownRowId,
          Object: pgRowId.Row,
        });
        await this.cellService.createCell({
          Col: COLUMN_IDS.SHARED.ROW_TYPE,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }
    }
  }

  private createSlug(str: string) {
    return str
      .toLowerCase() // Convert to lowercase
      .replace(/[^\w\s-]/g, '') // Remove all non-word characters (excluding spaces and hyphens)
      .trim() // Trim leading/trailing spaces
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with a single hyphen
  }

  /**
   * Processes the status from an element by extracting the row IDs corresponding to the given key.
   *
   * If the value associated with the key is a semicolon-separated string, it splits the string,
   * retrieves the corresponding row IDs, and returns them as an array. If the value is a single
   * entry, it returns the row ID directly. If the key does not exist, it returns null.
   *
   * @param {any} el - The element containing the status key.
   * @param {string} key - The key used to retrieve the status value from the element.
   * @returns {Promise<number[] | null>} - A promise that resolves to an array of row IDs or null if no status exists.
   */
  private async processStatus(el: any, key: string): Promise<number[] | null> {
    if (!el[key]) {
      return null;
    }

    const statuses = await (this.isSemicolonSeparated(el[key])
      ? Promise.all(el[key].split(';').map(async (status) => (await this.getRowId('JSON', status.trim()))?.Row))
      : [(await this.getRowId('JSON', el[key].trim()))?.Row]);
    return statuses;
  }

  /**
   * Converts a semicolon-separated string of items into their corresponding row IDs.
   *
   * If the input string is empty, the function returns null. If the string contains multiple items,
   * it splits the string and retrieves the corresponding row IDs for each item. If the string is a
   * single entry, it retrieves the row ID directly. The row IDs are returned as an array.
   *
   * @param {string} itemString - A semicolon-separated string of item identifiers.
   * @returns {Promise<number[] | null>} - A promise that resolves to an array of row IDs or null if the string is empty.
   */
  private async processStringToRowIds(itemString: string): Promise<number[] | null> {
    if (!itemString) {
      return null;
    }

    const rowIds = await (this.isSemicolonSeparated(itemString)
      ? Promise.all(
          itemString.split(';').map(async (singleString) => (await this.getRowId('JSON', singleString.trim()))?.Row),
        )
      : [(await this.getRowId('JSON', itemString.trim()))?.Row]);
    return rowIds;
  }

  /**
   * Inserts all cols sheet data into the database.
   *
   * This function processes the sheet data and inserts each cols data into various
   * related tables in the database. It includes creating col records, row records,
   * and associated cells for different attributes.
   *
   * @param {any[]} sheetData - The raw sheet data to be processed.
   * @param {string[]} sheetColumns - The column names of the sheet data.
   * @returns {Promise<void>} - A promise that resolves when the insertion is complete.
   */
  private async insertAllColsSheetData(sheetData: any[], sheetColumns: string[]): Promise<void> {
    // Process and normalize the sheet data
    const colsData = await this.processSheetData(sheetData, sheetColumns);

    // Iterate through each processed col element
    for (const colEl of colsData) {
      // Find the column by its ID
      const col = await this.colService.findOne(colEl.Col_ID);

      // Retrieve row IDs for different Token IDs
      const pageIdRowId = await this.getRowId('JSON', TOKEN_NAMES.PageID);
      const colIdRowId = await this.getRowId('JSON', TOKEN_NAMES.ColID);
      const rowId = await this.getRowId('JSON', TOKEN_NAMES.RowID);
      const colStatuses = await this.processStatus(colEl, 'Col_Status');
      const rowStatuses = await this.processStatus(colEl, 'Row_Status');
      const mlTextRowId = await this.getRowId('JSON', TOKEN_NAMES.MLText);
      const dropDownRowId = await this.getRowId('JSON', TOKEN_NAMES.DropDown);
      const dropDownSourceRowId = await this.getRowId('JSON', TOKEN_NAMES.DropDownSource);
      const colRowRowId = await this.getRowId('JSON', TOKEN_NAMES.ColRow);

      // Retrieve the last inserted user record
      const user = await this.userService.getLastInsertedRecord();

      // Create a tFormat record for the col
      await this.formatService.createFormat({
        User: user.User,
        ObjectType: colIdRowId,
        Object: col.Col,
        Status: colStatuses,
        Formula: colEl.Col_Formula ? { 3000000380: colEl.Col_Formula } : null,
        Comment: colEl.Col_Comment ? { [SYSTEM_INITIAL.ENGLISH]: colEl.Col_Comment } : null,
      });

      // Create a new tRow record for the col
      const createdRow = await this.rowService.createRow({
        Row: colEl.Row,
        Pg: PAGE_IDS.ALL_COLS,
        RowLevel: 1,
      });

      // Create a tFormat for the row
      await this.formatService.createFormat({
        User: user.User,
        ObjectType: rowId,
        Object: createdRow.Row,
        Owner: user.User,
        Status: rowStatuses,
      });

      // Check and insert col ID
      if (COLUMN_NAMES.Col_ID in colEl && colEl.Col_ID != null) {
        const createdItem = await this.itemService.createItem({
          DataType: colIdRowId,
          Object: col.Col,
        });
        await this.cellService.createCell({
          Col: COLUMN_IDS.ALL_COLS.Col_ID,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }

      // Check and insert page type
      if (COLUMN_NAMES.Page_Type in colEl && colEl.Page_Type != null) {
        const pageTypeObjectId = await this.getRowId('JSON', colEl.Page_Type);
        const createdItem = await this.itemService.createItem({
          DataType: dropDownRowId,
          Object: pageTypeObjectId.Row,
        });
        await this.cellService.createCell({
          Col: COLUMN_IDS.ALL_COLS.PAGE_TYPE,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }

      // Check and insert page ID
      if (COLUMN_NAMES.Page_ID in colEl && colEl.Page_ID != null) {
        const createdItem = await this.itemService.createItem({
          DataType: pageIdRowId,
          Object: colEl.Page_ID,
        });
        await this.cellService.createCell({
          Col: COLUMN_IDS.ALL_COLS.PAGE_ID,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }

      // Check and insert col name
      if (COLUMN_NAMES.Col_Name in colEl && colEl.Col_Name != null) {
        const createdItem = await this.itemService.createItem({
          DataType: mlTextRowId,
          JSON: { [SYSTEM_INITIAL.ENGLISH]: colEl.Col_Name },
        });
        await this.cellService.createCell({
          Col: COLUMN_IDS.ALL_COLS.COL_NAME,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }

      // Check and insert col data type
      if (COLUMN_NAMES.Col_DataType in colEl && colEl.Col_DataType != null) {
        const colDataTypeObjectId = await this.getRowId('JSON', colEl.Col_DataType);
        const createdItem = await this.itemService.createItem({
          DataType: dropDownRowId,
          Object: colDataTypeObjectId.Row,
        });
        await this.cellService.createCell({
          Col: COLUMN_IDS.ALL_COLS.COL_DATATYPE,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }

      // Check and insert col dropdown source
      if (COLUMN_NAMES.Col_DropDownSource in colEl && colEl.Col_DropDownSource != null) {
        const colDropDownSourceJson = await this.getRowId('JSON', colEl.Col_DropDownSource);
        if (colDropDownSourceJson) {
          const createdItem = await this.itemService.createItem({
            DataType: dropDownSourceRowId,
            JSON: { 3000000375: colDropDownSourceJson.Row },
          });
          await this.cellService.createCell({
            Col: COLUMN_IDS.ALL_COLS.COL_DROPDOWNSOURCE,
            Row: createdRow.Row,
            Items: [createdItem.Item],
          });
        }
      }

      // Check and insert row type
      if (COLUMN_NAMES.Row_Type in colEl && colEl.Row_Type != null) {
        const createdItem = await this.itemService.createItem({
          DataType: dropDownRowId,
          Object: colRowRowId.Row,
        });
        await this.cellService.createCell({
          Col: COLUMN_IDS.SHARED.ROW_TYPE,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }
    }
  }

  /**
   * Processes sheet data by filtering out rows and columns that are entirely null,
   * and normalizing the column names.
   *
   * @param {any[]} sheetData - The raw sheet data to be processed.
   * @param {string[]} sheetColumns - The column names of the sheet data.
   * @returns {Promise<any[]>} - A promise that resolves to an array of processed data objects.
   */
  private async processSheetData(sheetData: any[], sheetColumns: string[]): Promise<any[]> {
    // Filter out rows where all values are null
    const filteredData = sheetData.filter((row) => !this.isAllNull(row));

    // Identify columns that have at least one non-null value
    const validColumns = filteredData[0].map((_, colIndex) => filteredData.some((row) => row[colIndex] !== null));

    // Filter rows to include only valid columns
    const filteredRows = filteredData.map((row) => row.filter((_, colIndex) => validColumns[colIndex]));

    // Normalize column names: trim whitespace, remove nulls, replace spaces and hyphens with underscores
    const filteredColumns = sheetColumns
      .filter((colName) => colName !== null)
      .map((colName) => colName.trim())
      .filter((colName) => colName !== '')
      .map((colName) => colName.replace(/[\s-]+/g, '_'));

    // Map filtered rows to objects with normalized column names as keys
    const processedData: any = filteredRows.map((row) =>
      filteredColumns.reduce((acc, colName, index) => {
        acc[colName] = row[index];
        return acc;
      }, {}),
    );
    return processedData;
  }

  /**
   * Inserts all tokens data from the sheet into the database.
   *
   * This function processes the token data from the provided sheet, creates rows, and then inserts
   * the relevant cells and items. It also handles the insertion of records into the user table,
   * row formatting, and updating row types.
   *
   * @param {any[]} sheetData - The raw sheet data to be processed.
   * @returns {Promise<void>} - A promise that resolves when the insertion is complete.
   */
  private async insertAllTokensData(sheetData: any[]): Promise<void> {
    const allTokenData = [];

    // Process each row in the sheet data
    for (const [rowIndex, row] of sheetData.entries()) {
      allTokenData[rowIndex] = {
        Row: row[0],
        TOKEN: row.slice(1, 6).find((value) => value != null),
        Row_Type: row[7] ?? row[7],
        Row_Status: row[8] ?? row[8],
        Row_Comment: row[9] ?? row[9],
        Row_level: this.calculateRowLevel(row.slice(1, 6)),
      };
    }

    // Iterate through each processed token element
    for (const tokenEl of allTokenData) {
      // Create the tRow
      const createdRow = await this.rowService.createRow({
        Row: tokenEl.Row,
        Pg: PAGE_IDS.ALL_TOKENS,
        RowLevel: tokenEl.Row_Status == SECTION_HEAD ? 0 : tokenEl.Row_level,
      });

      // Check and insert Token
      if (COLUMN_NAMES.TOKEN in tokenEl) {
        const createdItem = await this.itemService.createItem({
          DataType: createdRow.Row,
          JSON: { 3000000100: tokenEl.TOKEN },
        });
        await this.cellService.createCell({
          Col: COLUMN_IDS.ALL_TOKENS.TOKEN,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }
    }

    // Insert records into the tUser table
    await this.insertRecordIntoUserTable();

    // Insert tFormat records for token rows
    await this.rowFormatRecord(allTokenData);

    // Update the row types
    await this.updateRowType(allTokenData);
  }

  /**
   * Inserts a new record into the tUser table.
   *
   * This function retrieves the last inserted row, determine the next row primary key,
   * creates a new row, and then inserts a new user record associated with that row.
   *
   * @returns {Promise<void>} - A promise that resolves when the insertion is complete.
   */
  private async insertRecordIntoUserTable(): Promise<void> {
    const userIdRowId = await this.getRowId('JSON', TOKEN_NAMES.UserID);
    let nextRowPk = 0;

    // Retrieve the last inserted row to determine the next primary key
    const lastRowInserted = await this.rowService.getLastInsertedRecord();
    nextRowPk = +lastRowInserted.Row + 1;

    // Create a new row with the primary key
    const createdRow = await this.rowService.createRow({
      Row: nextRowPk,
      RowLevel: 1,
    });

    // Create a new user associated with the newly created row
    await this.userService.createUser({
      User: createdRow.Row,
      UserType: userIdRowId,
    });
  }

  /**
   * Inserts a new record into the tFormat table.
   *
   * This function iterates through the token data, finds the corresponding row, and creates
   * a format record for each row with the necessary information, such as user, object type,
   * owner, status, and comments.
   *
   * @param {any[]} allTokenData - The token data to format.
   * @returns {Promise<void>} - A promise that resolves when the formatting is complete.
   */
  private async rowFormatRecord(allTokenData: any[]): Promise<void> {
    const objectTypeRowId = await this.getRowId('JSON', TOKEN_NAMES.RowID);
    const sectionHeadRowId = await this.getRowId('JSON', TOKEN_NAMES.SectionHead);
    const user = await this.userService.getLastInsertedRecord();

    // Iterate through each token element to format the row records
    for (const tokenEl of allTokenData) {
      const row = await this.rowService.findOne(tokenEl.Row);

      // Create a format record for the row
      await this.formatService.createFormat({
        User: user.User,
        ObjectType: objectTypeRowId,
        Object: row.Row,
        Owner: user.User,
        Status: tokenEl.Row_Status ? [sectionHeadRowId.Row] : null,
        Comment: tokenEl.Row_Comment ? { 3000000100: tokenEl.Row_Comment } : null,
      });
    }
  }

  /**
   * Calculates the level of a row based on the first non-null value in the given array.
   *
   * The level is determined as follows:
   * - If the first element is truthy, the level is 1.
   * - If the second element is truthy, the level is 2.
   * - If the third element is truthy, the level is 3.
   * - If the fourth element is truthy, the level is 4.
   * - If the fifth element is truthy, the level is 5.
   *
   * @param {Array<any>} rowArray - An array of values from a row.
   * @returns {number} - The calculated row level, or undefined if no conditions are met.
   */
  private calculateRowLevel(rowArray: Array<any>): number {
    if (rowArray.length > 0) {
      if (rowArray[0]) {
        return 1;
      } else if (rowArray[1]) {
        return 2;
      } else if (rowArray[2]) {
        return 3;
      } else if (rowArray[3]) {
        return 4;
      } else if (rowArray[4]) {
        return 5;
      }
    }
  }

  /**
   * Populates the sibling row for each row based on their levels.
   *
   * This function iterates through all rows in ascending order. For each row, it checks subsequent
   * rows to find a sibling (a row with the same level and a higher row number). The first matching
   * sibling is updated in the database.
   *
   * @returns {Promise<void>} - A promise that resolves when all sibling rows have been populated.
   */
  public async populateSiblingRowColumn(): Promise<void> {
    const allRows = await this.rowService.findAllOrderByIdAsc();
    let outerIndex = 0;
    allRows.forEach(async (outerRow) => {
      outerIndex++;
      let innerIndex = outerIndex;
      while (innerIndex < allRows.length) {
        if (outerRow.RowLevel > allRows[innerIndex].RowLevel) {
          break;
        }
        if (
          outerRow.RowLevel === allRows[innerIndex].RowLevel &&
          outerRow.Row != allRows[innerIndex].Row &&
          outerRow.Row < allRows[innerIndex].Row
        ) {
          await this.rowService.updateRow(outerRow.Row, {
            SiblingRow: allRows[innerIndex].RowLevel == 0 ? null : allRows[innerIndex],
          });
          break;
        }
        innerIndex++;
      }
    });
  }

  /**
   * Populates the parent row for each row based on their levels.
   *
   * This function iterates through all rows in descending order. For each row, it checks preceding
   * rows to find a parent (a row with a lower row number and a lower level). The first matching
   * parent is updated in the database.
   *
   * @returns {Promise<void>} - A promise that resolves when all parent rows have been populated.
   */
  public async populateParentRowColumn(): Promise<void> {
    const allRows = await this.rowService.findAllOrderByIdDesc();
    let outerIndex = 0;
    allRows.forEach(async (outerRow) => {
      outerIndex++;
      let innerIndex = outerIndex;
      while (innerIndex < allRows.length) {
        if (
          outerRow.Row != allRows[innerIndex].Row &&
          outerRow.Row > allRows[innerIndex].Row &&
          outerRow.RowLevel > allRows[innerIndex].RowLevel
        ) {
          await this.rowService.updateRow(outerRow.Row, {
            ParentRow: allRows[innerIndex].RowLevel == 0 ? null : allRows[innerIndex],
          });
          break;
        }
        innerIndex++;
      }
    });
  }

  /**
   * Inserts all language data from a provided sheet into the database.
   *
   * This function processes the incoming sheet data, creates rows for each language entry,
   * and populates the corresponding database tables with the necessary information.
   * It handles row formatting, status processing, and cell creation for language names and row types.
   *
   * @param {any[]} sheetData - The raw sheet data to be processed.
   * @param {string[]} sheetColumns - The column names of the sheet data.
   * @returns {Promise<void>} - A promise that resolves when all languages have been processed and inserted.
   */
  private async insertAllLanguagesSheetData(sheetData: any[], sheetColumns: string[]): Promise<void> {
    // Process and normalize the sheet data
    const languagesData = await this.processSheetData(sheetData, sheetColumns);

    // Retrieve row IDs for different Token IDs
    const dataTypeRowId = await this.getRowId('JSON', TOKEN_NAMES.RowID);
    const rowStatuses = await this.processStatus(languagesData[0], 'Row_Status');
    const mlTextRowId = await this.getRowId('JSON', TOKEN_NAMES.MLText);

    // Iterate through each processed lang element
    for (const langEL of languagesData) {
      let nextRowPk = 0;
      const lastRowInserted = await this.rowService.getLastInsertedRecord();
      nextRowPk = +lastRowInserted.Row + 1;

      // Create a new row in the database for the language
      const createdRow = await this.rowService.createRow({
        Row: nextRowPk,
        Pg: PAGE_IDS.ALL_LANGUAGES,
        RowLevel: langEL.Row_Status == SECTION_HEAD ? 0 : 1,
      });

      // Create tFormat record for the newly created row
      const user = await this.userService.getLastInsertedRecord();
      await this.formatService.createFormat({
        User: user.User,
        ObjectType: dataTypeRowId,
        Object: createdRow.Row,
        Owner: user.User,
        Status: langEL.Row_Status ? rowStatuses : null,
        Comment: langEL.Row_Comment ? { [SYSTEM_INITIAL.ENGLISH]: langEL.Row_Comment } : null,
      });

      // Check and insert language
      if (COLUMN_NAMES.Language in langEL && langEL.Language != null) {
        const createdItem = await this.itemService.createItem({
          DataType: mlTextRowId,
          JSON: { [SYSTEM_INITIAL.ENGLISH]: langEL.Language },
        });
        await this.cellService.createCell({
          Col: COLUMN_IDS.ALL_LANGUAGES.LANGUAGE,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }

      // Check and insert row type
      if (COLUMN_NAMES.Row_Type in langEL && langEL.Row_Type != null) {
        const createdItem = await this.itemService.createItem({
          DataType: mlTextRowId,
          Object: SYSTEM_INITIAL.DEFAULT,
        });
        await this.cellService.createCell({
          Col: COLUMN_IDS.SHARED.ROW_TYPE,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }
    }
  }

  /**
   * Inserts region data from the provided sheet into the database.
   *
   * This function filters the sheet data to remove rows where all values are null,
   * processes the remaining rows, and creates new records in the database for each region.
   * It also handles row formatting and status processing.
   *
   * @param {any[]} sheetData - The data from the sheet representing multiple regions.
   * @returns {Promise<void>} - A promise that resolves when all regions have been processed and inserted.
   */
  private async insertAllRegionsSheetData(sheetData: any[]): Promise<void> {
    // Filter out rows that are completely null
    const filteredAllRegionsData = sheetData.filter((row) => !this.isAllNull(row));

    const allRegionsData = [];
    for (const [rowIndex, row] of filteredAllRegionsData.entries()) {
      allRegionsData[rowIndex] = {
        Region: row.slice(0, 6).find((value) => value != null),
        Row_Type: row[7] ?? row[7],
        Row_Status: row[8] ?? row[8],
        Row_Comment: row[9] ?? row[9],
        Row_Level: this.calculateRowLevel(row.slice(1)),
      };
    }

    // Retrieve row IDs for different token IDs
    const dataTypeRowId = await this.getRowId('JSON', TOKEN_NAMES.RowID);
    const mlTextRowId = await this.getRowId('JSON', TOKEN_NAMES.MLText);
    const rowStatuses = await this.processStatus(allRegionsData[0], 'Row_Status');

    // Iterate through each processed region element
    for (const regionEl of allRegionsData) {
      let nextRowPk = 0;
      const lastRowInserted = await this.rowService.getLastInsertedRecord();
      nextRowPk = +lastRowInserted.Row + 1;

      // Create a new row in the database for the region
      const createdRow = await this.rowService.createRow({
        Row: nextRowPk,
        Pg: PAGE_IDS.ALL_REGIONS,
        RowLevel: regionEl.Row_Status == SECTION_HEAD ? 0 : regionEl.Row_Level,
      });

      // Create a tFormat record for the newly created row
      const user = await this.userService.getLastInsertedRecord();
      await this.formatService.createFormat({
        User: user.User,
        ObjectType: dataTypeRowId,
        Object: createdRow.Row,
        Owner: user.User,
        Status: regionEl.Row_Status ? rowStatuses : null,
        Comment: regionEl.Row_Comment ? { [SYSTEM_INITIAL.ENGLISH]: regionEl.Row_Comment } : null,
      });

      // Check and insert region name
      if (COLUMN_NAMES.Region in regionEl && regionEl.Region != null) {
        const createdItem = await this.itemService.createItem({
          DataType: mlTextRowId,
          JSON: { [SYSTEM_INITIAL.ENGLISH]: regionEl.Region },
        });
        await this.cellService.createCell({
          Col: COLUMN_IDS.ALL_REGIONS.REGION,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }

      // Check and insert row type
      if (COLUMN_NAMES.Row_Type in regionEl && regionEl.Row_Type != null) {
        const rowTypeRowId = await this.getRowId('JSON', regionEl.Row_Type);
        const createdItem = await this.itemService.createItem({
          DataType: mlTextRowId,
          Object: rowTypeRowId.Row,
        });
        await this.cellService.createCell({
          Col: COLUMN_IDS.SHARED.ROW_TYPE,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }
    }
  }

  /**
   * Inserts supplier data from the provided sheet into the database.
   *
   * This function filters the sheet data to remove rows where all values are null,
   * processes the remaining rows, and creates new records in the database for each supplier.
   * It handles row formatting, status processing
   *
   * @param {any[]} sheetData - The data from the sheet representing multiple suppliers.
   * @returns {Promise<void>} - A promise that resolves when all suppliers have been processed and inserted.
   */
  private async insertAllSuppliersSheetData(sheetData: any[]): Promise<void> {
    // Filter out rows that are completely null
    const filteredAllSuppliersData = sheetData.filter((row) => !this.isAllNull(row));

    const allSuppliersData = [];
    for (const [rowIndex, row] of filteredAllSuppliersData.entries()) {
      allSuppliersData[rowIndex] = {
        Supplier: row.slice(0, 7).find((value) => value != null),
        Row_Type: row[8] ?? row[8],
        Row_Status: row[9] ?? row[9],
        Row_Comment: row[10] ?? row[10],
        Row_Level: this.calculateRowLevel(row),
      };
    }

    // Retrieve row IDs for different token IDs
    const dataTypeRowId = await this.getRowId('JSON', TOKEN_NAMES.RowID);
    const mlTextRowId = await this.getRowId('JSON', TOKEN_NAMES.MLText);
    const rowStatuses = await this.processStatus(allSuppliersData[0], 'Row_Status');

    // Iterate through each processed supplier element
    for (const supplierEl of allSuppliersData) {
      let nextRowPk = 0;
      const lastRowInserted = await this.rowService.getLastInsertedRecord();
      nextRowPk = +lastRowInserted.Row + 1;

      // Create a new row in the database for the supplier
      const createdRow = await this.rowService.createRow({
        Row: nextRowPk,
        Pg: PAGE_IDS.ALL_SUPPLIERS,
        RowLevel: supplierEl.Row_Status == SECTION_HEAD ? 0 : supplierEl.Row_Level,
      });

      // Create a tFormat record for the newly created row
      const user = await this.userService.getLastInsertedRecord();
      await this.formatService.createFormat({
        User: user.User,
        ObjectType: dataTypeRowId,
        Object: createdRow.Row,
        Owner: user.User,
        Status: supplierEl.Row_Status ? rowStatuses : null,
        Comment: supplierEl.Row_Comment ? { [SYSTEM_INITIAL.ENGLISH]: supplierEl.Row_Comment } : null,
      });

      // Check and insert supplier if available
      if (COLUMN_NAMES.Supplier in supplierEl && supplierEl.Supplier != null) {
        const createdItem = await this.itemService.createItem({
          DataType: mlTextRowId,
          JSON: { [SYSTEM_INITIAL.ENGLISH]: supplierEl.Supplier },
        });
        await this.cellService.createCell({
          Col: COLUMN_IDS.ALL_SUPPLIERS.SUPPLIER,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }

      // Check and insert row type if available
      if (COLUMN_NAMES.Row_Type in supplierEl && supplierEl.Row_Type != null) {
        const rowTypeRowIds = await this.processStatus(supplierEl, 'Row_Type');
        if (rowTypeRowIds != null && rowTypeRowIds.length > 0) {
          const itemIds = [];
          for (const rowTypeId of rowTypeRowIds) {
            const createdItem = await this.itemService.createItem({
              DataType: mlTextRowId,
              Object: rowTypeId,
            });
            itemIds.push(createdItem.Item);
          }
          await this.cellService.createCell({
            Col: COLUMN_IDS.SHARED.ROW_TYPE,
            Row: createdRow.Row,
            Items: itemIds,
          });
        }
      }
    }
  }

  /**
   * Inserts model data from the provided sheet into the database.
   *
   * This function filters the sheet data to remove rows where all values are null,
   * processes the remaining rows, and creates new records in the database for each model.
   * It handles row formatting, status processing, and inserts relevant model details,
   * including release dates and row types.
   *
   * @param {any[]} sheetData - The data from the sheet representing multiple models.
   * @returns {Promise<void>} - A promise that resolves when all models have been processed and inserted.
   */
  private async insertAllModelsSheetData(sheetData: any[]): Promise<void> {
    // Filter out rows that are completely null
    const filteredAllModelsData = sheetData.filter((row) => !this.isAllNull(row));

    const allModelsData = [];
    for (const [rowIndex, row] of filteredAllModelsData.entries()) {
      allModelsData[rowIndex] = {
        Model: row.slice(0, 7).find((value) => value != null),
        Release_Date: row[8] ? new Date((row[8] - 25569) * 86400 * 1000).toLocaleDateString() : null,
        Row_Type: row[9] ?? row[9],
        Row_Status: row[10] ?? row[10],
        Row_Comment: row[11] ?? row[11],
        Row_Level: this.calculateRowLevel(row),
      };
    }

    // Retrieve row IDs for different token IDs
    const dataTypeRowId = await this.getRowId('JSON', TOKEN_NAMES.RowID);
    const mlTextRowId = await this.getRowId('JSON', TOKEN_NAMES.MLText);
    const dateRowId = await this.getRowId('JSON', TOKEN_NAMES.Date);
    const rowStatuses = await this.processStatus(allModelsData[0], 'Row_Status');

    // Iterate through each processed model element
    for (const modelEl of allModelsData) {
      let nextRowPk = 0;
      const lastRowInserted = await this.rowService.getLastInsertedRecord();
      nextRowPk = +lastRowInserted.Row + 1;

      // Create a new row in the database for the model
      const createdRow = await this.rowService.createRow({
        Row: nextRowPk,
        Pg: PAGE_IDS.ALL_MODELS,
        RowLevel: modelEl.Row_Status == SECTION_HEAD ? 0 : modelEl.Row_Level,
      });

      // Create a tFormat record for the newly created row
      const user = await this.userService.getLastInsertedRecord();
      await this.formatService.createFormat({
        User: user.User,
        ObjectType: dataTypeRowId,
        Object: createdRow.Row,
        Owner: user.User,
        Status: modelEl.Row_Status ? rowStatuses : null,
        Comment: modelEl.Row_Comment ? { [SYSTEM_INITIAL.ENGLISH]: modelEl.Row_Comment } : null,
      });

      // Check and insert model if available
      if (COLUMN_NAMES.Model in modelEl && modelEl.Model != null) {
        const createdItem = await this.itemService.createItem({
          DataType: mlTextRowId,
          JSON: { [SYSTEM_INITIAL.ENGLISH]: modelEl.Model },
        });
        await this.cellService.createCell({
          Col: COLUMN_IDS.ALL_MODELS.MODEL,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }

      // Check and insert release date if available
      if (COLUMN_NAMES.Release_Date in modelEl && modelEl.Release_Date != null) {
        const createdItem = await this.itemService.createItem({
          DataType: dateRowId,
          DateTime: new Date(modelEl.Release_Date).toISOString(),
        });
        await this.cellService.createCell({
          Col: COLUMN_IDS.ALL_MODELS.RELEASE_DATE,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }

      // Check and insert row type if available
      if (COLUMN_NAMES.Row_Type in modelEl && modelEl.Row_Type != null) {
        const rowTypeRowIds = await this.processStatus(modelEl, 'Row_Type');
        if (rowTypeRowIds != null && rowTypeRowIds.length > 0) {
          const itemIds = [];
          for (const rowTypeId of rowTypeRowIds) {
            const createdItem = await this.itemService.createItem({
              DataType: mlTextRowId,
              Object: rowTypeId,
            });
            itemIds.push(createdItem.Item);
          }
          await this.cellService.createCell({
            Col: COLUMN_IDS.SHARED.ROW_TYPE,
            Row: createdRow.Row,
            Items: itemIds,
          });
        }
      }
    }
  }

  /**
   * Inserts unit data from the provided sheet into the database.
   *
   * This function processes the sheet data to extract unit information, including unit,
   * unit factors, row types, statuses, and comments. It creates new records in the database
   * and links relevant data through item and cell creations.
   *
   * @param {any[]} sheetData - The data from the sheet representing multiple units.
   * @returns {Promise<void>} - A promise that resolves when all units have been processed and inserted.
   */
  private async insertAllUnitsSheetData(sheetData: any[]): Promise<void> {
    const user = await this.userService.getLastInsertedRecord();

    const allUnitsData = [];
    for (const [rowIndex, row] of sheetData.entries()) {
      allUnitsData[rowIndex] = {
        Unit: row.slice(1, 3).find((value) => value != null),
        Unit_Factor: row[3] ?? row[3],
        Row_Type: row[4] ?? row[4],
        Row_Status: row[5] ?? row[5],
        Row_Comment: row[6] ?? row[6],
        Row_Level: this.calculateRowLevel(row.slice(1)),
      };
    }

    // Iterate through each processed unit element
    for (const unitEl of allUnitsData) {
      let nextRowPk = 0;
      const lastRowInserted = await this.rowService.getLastInsertedRecord();
      nextRowPk = +lastRowInserted.Row + 1;

      // Retrieve row IDs for different token IDs
      const rowObjectRowId = await this.getRowId('JSON', TOKEN_NAMES.RowID);
      const mlTextRowId = await this.getRowId('JSON', TOKEN_NAMES.MLText);
      const numberRowId = await this.getRowId('JSON', TOKEN_NAMES.Number);
      const dropDownRowId = await this.getRowId('JSON', TOKEN_NAMES.DropDown);
      const rowStatuses = await this.processStringToRowIds(unitEl.Row_Status);

      // Create a new row in the database for the unit
      const createdRow = await this.rowService.createRow({
        Row: nextRowPk,
        Pg: PAGE_IDS.ALL_UNITS,
        RowLevel: unitEl.Row_Status == SECTION_HEAD ? 0 : unitEl.Row_Level,
      });

      // Create a tFormat record for the newly created row
      await this.formatService.createFormat({
        User: user.User,
        ObjectType: rowObjectRowId,
        Object: createdRow.Row,
        Owner: user.User,
        Status: unitEl.Row_Status ? rowStatuses : null,
        Comment: unitEl.Row_Comment ? { [SYSTEM_INITIAL.ENGLISH]: unitEl.Row_Comment } : null,
      });

      // Check and insert unit if available
      if (COLUMN_NAMES.Unit in unitEl && unitEl.Unit) {
        const createdItem = await this.itemService.createItem({
          DataType: mlTextRowId,
          JSON: { [SYSTEM_INITIAL.ENGLISH]: unitEl.Unit },
        });
        await this.cellService.createCell({
          Col: COLUMN_IDS.ALL_UNITS.UNIT, // Col-ID of "Unit"
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }

      // Check and insert unit factor if available
      if (COLUMN_NAMES.Unit_Factor in unitEl && unitEl.Unit_Factor) {
        const createdItem = await this.itemService.createItem({
          DataType: numberRowId,
          Num: unitEl.Unit_Factor,
        });
        await this.cellService.createCell({
          Col: COLUMN_IDS.ALL_UNITS.UNIT_FACTOR, // Col-ID of "Unit Factor"
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }

      // Check and insert row type if available
      if (COLUMN_NAMES.Row_Type in unitEl && unitEl.ROW_TYPE) {
        const rowTypes = await this.processStringToRowIds(unitEl.ROW_TYPE as string);
        const createdItemIds = [];
        for (const rowId of rowTypes) {
          const createdItem = await this.itemService.createItem({
            DataType: dropDownRowId,
            Object: rowId,
          });
          createdItemIds.push(createdItem.Item);
        }
        await this.cellService.createCell({
          Col: COLUMN_IDS.SHARED.ROW_TYPE, // Col-ID of "Row Type"
          Row: createdRow.Row,
          Items: createdItemIds,
        });
      }
    }
  }

  /**
   * Inserts label data from the provided sheet into the database.
   *
   * This function processes the sheet data to extract label information, including label,
   * value data types, dropdown sources, default data, statuses, formulas, row types, and comments.
   * It creates new records in the database and links relevant data through item and cell creations.
   *
   * @param {any[]} sheetData - The data from the sheet representing multiple labels.
   * @returns {Promise<void>} - A promise that resolves when all labels have been processed and inserted.
   */
  private async insertAllLabelsSheetData(sheetData: any[]): Promise<void> {
    // Retrieve the last inserted user record
    const user = await this.userService.getLastInsertedRecord();

    // Retrieve row IDs for various token IDs
    const rowObjectRowId = await this.getRowId('JSON', TOKEN_NAMES.RowID);
    const dropDownRowId = await this.getRowId('JSON', TOKEN_NAMES.DropDown);
    const dropDownSourceRowId = await this.getRowId('JSON', TOKEN_NAMES.DropDownSource);
    const mlTextRowId = await this.getRowId('JSON', TOKEN_NAMES.MLText);
    const ddsTypeRowId = (await this.getRowId('JSON', TOKEN_NAMES.DDSType)).Row; // DDS-Type as 3000000375
    const valueDataTypeRowId = await this.getRowId('JSON', TOKEN_NAMES.ValueDataType);
    const formulaRowId = await this.getRowId('JSON', TOKEN_NAMES.Formula);
    const validateDataRowId = (await this.getRowId('JSON', TOKEN_NAMES.Formula)).Row; // Validate Data as 3000000382

    // Filter out rows where all elements are null
    const filteredAllLabelsData = sheetData.filter((row) => !this.isAllNull(row));

    const allLabelsData = [];
    for (const [rowIndex, row] of filteredAllLabelsData.entries()) {
      allLabelsData[rowIndex] = {
        Label:
          row[0] != null
            ? row[0]
            : row[1] != null
              ? row[1]
              : row[2] != null
                ? row[2]
                : row[3] != null
                  ? row[3]
                  : row[4],
        Value_DataType: row[6] == null ? '' : row[6],
        Value_DropDownSource: row[7] == null ? '' : row[7],
        Value_DefaultData: row[8] == null ? '' : row[8],
        Value_Status: row[9] == null ? '' : row[9],
        Value_Formula: row[10] == null ? '' : row[10],
        Row_Type: row[11] == null ? '' : row[11],
        Row_Status: row[12] == null ? '' : row[12],
        Row_Comment: row[13] == null ? '' : row[13],
        Row_Level: this.calculateRowLevel(row), // Calculate row level based on the row data
      };
    }

    for (const labelEl of allLabelsData) {
      let nextRowPk = 0;
      const lastRowInserted = await this.rowService.getLastInsertedRecord();
      nextRowPk = +lastRowInserted.Row + 1;

      // Creating a new row in the database
      const createdRow = await this.rowService.createRow({
        Row: nextRowPk,
        Pg: PAGE_IDS.ALL_LABELS,
        RowLevel: labelEl.Row_Status == SECTION_HEAD ? 0 : labelEl.Row_Level,
      });

      // Create a tFormat record for the newly created row
      const createdFormat = await this.formatService.createFormat({
        User: user.User,
        ObjectType: rowObjectRowId,
        Object: createdRow.Row,
        Owner: user.User,
      });

      // Iterate through the label element properties and process them
      for (const [key, val] of Object.entries(labelEl)) {
        if (key == COLUMN_NAMES.Label && val) {
          const createdItem = await this.itemService.createItem({
            DataType: mlTextRowId,
            JSON: { [SYSTEM_INITIAL.ENGLISH]: val },
          });
          await this.cellService.createCell({
            Col: COLUMN_IDS.ALL_LABELS.LABELS, // Col-ID of "Label"
            Row: createdRow.Row,
            Items: [createdItem.Item],
          });
        } else if (key == COLUMN_NAMES.Value_DataType && val) {
          const objectRowId = await this.getRowId('JSON', val);
          if (objectRowId) {
            const createdItem = await this.itemService.createItem({
              DataType: dropDownRowId,
              Object: objectRowId.Row,
            });
            await this.cellService.createCell({
              Col: COLUMN_IDS.ALL_LABELS.VALUE_DATATYPE, // Col-ID of "Value Data-Type"
              Row: createdRow.Row,
              Items: [createdItem.Item],
            });
          }
        } else if (key == COLUMN_NAMES.Value_DropDownSource && val) {
          const rowsIds = await this.processStringToRowIds(val as string);
          const createdItemIds = [];
          for (const rowId of rowsIds) {
            const createdItem = await this.itemService.createItem({
              DataType: dropDownSourceRowId,
              JSON: { [ddsTypeRowId]: rowId },
            });
            createdItemIds.push(createdItem.Item);
          }
          await this.cellService.createCell({
            Col: COLUMN_IDS.ALL_LABELS.VALUE_DROPDOWNSOURCE, // Col-ID of "Value DropDown-Source"
            Row: createdRow.Row,
            Items: createdItemIds,
          });
        } else if (key == COLUMN_NAMES.Value_DefaultData && val) {
          const colValues = String(val).split(';'); // Split default data by semicolon
          const createdItemIds = [];
          for (const value of colValues) {
            const createdItem = await this.itemService.createItem({
              DataType: valueDataTypeRowId,
              JSON: { [SYSTEM_INITIAL.ENGLISH]: value },
            });
            createdItemIds.push(createdItem.Item);
          }
          const createdCell = await this.cellService.createCell({
            Col: COLUMN_IDS.ALL_LABELS.VALUE_DEFAULTDATA, // Col-ID of "Value Default-Data"
            Row: 3000000201, // As per setup sheet - Row.Row = 0, Modify this to Row: 0
            Items: createdItemIds,
          });
          await this.formatService.updateFormat(createdFormat.Format, {
            Default: createdCell,
          });
        } else if (key == COLUMN_NAMES.Value_Status && val) {
          const valueStatusRows = await this.processStringToRowIds(val as string);
          const createdItemIds = [];
          for (const rowId of valueStatusRows) {
            const createdItem = await this.itemService.createItem({
              DataType: dropDownRowId,
              Object: rowId,
            });
            createdItemIds.push(createdItem.Item);
          }
          await this.cellService.createCell({
            Col: COLUMN_IDS.ALL_LABELS.VALUE_STATUS, // Col-ID of "Value_Status"
            Row: createdRow.Row,
            Items: createdItemIds,
          });
        } else if (key == COLUMN_NAMES.Value_Formula && val) {
          const createdItem = await this.itemService.createItem({
            DataType: formulaRowId,
            JSON: { [validateDataRowId]: val },
          });
          await this.cellService.createCell({
            Col: COLUMN_IDS.ALL_LABELS.VALUE_FORMULA, // Col-ID of "Value Formula"
            Row: createdRow.Row,
            Items: [createdItem.Item],
          });
        } else if (key == COLUMN_NAMES.Row_Type && val) {
          const rowTypes = await this.processStringToRowIds(val as string);
          const createdItemIds = [];
          for (const rowId of rowTypes) {
            const createdItem = await this.itemService.createItem({
              DataType: dropDownRowId,
              Object: rowId,
            });
            createdItemIds.push(createdItem.Item);
          }
          await this.cellService.createCell({
            Col: COLUMN_IDS.SHARED.ROW_TYPE, // Col-ID of "Row Type"
            Row: createdRow.Row,
            Items: createdItemIds,
          });
        } else if (key == COLUMN_NAMES.Row_Status && val) {
          const statusesRowIds = await this.processStringToRowIds(val as string);
          await this.formatService.updateFormat(createdFormat.Format, { Status: statusesRowIds });
        } else if (key == COLUMN_NAMES.Row_Comment && val) {
          await this.formatService.updateFormat(createdFormat.Format, { Comment: { [SYSTEM_INITIAL.ENGLISH]: val } });
        }
      }
    }
  }

  /**
   * Updates the row type for each token in the provided array of token data.
   *
   * This function checks the `Row_Type` of each token and creates a corresponding item
   * it associates the created item with the appropriate cell in the database.
   *
   * @param {any[]} allTokenData - An array of token data objects, each containing at least a `Row` and `Row_Type`.
   * @returns {Promise<void>} - A promise that resolves when all row types have been processed.
   */
  private async updateRowType(allTokenData: any[]): Promise<void> {
    // Retrieve the Row IDs of token IDs
    const dropDownRowId = await this.getRowId('JSON', TOKEN_NAMES.DropDown);
    const nodeRowId = await this.getRowId('JSON', TOKEN_NAMES.Node);

    // Iterate through each token in the provided data
    for (const tokenEl of allTokenData) {
      // Find the existing row in the database using the token's Row ID
      const tokenRow = await this.rowService.findOne(tokenEl.Row);

      // Check if Row_Type is specified for the current token
      if (tokenEl.Row_Type != null) {
        // Determine the appropriate object ID based on the Row_Type
        const object = tokenEl.Row_Type == 'Node' ? nodeRowId.Row : SYSTEM_INITIAL.DEFAULT;

        // Create an item
        const createdItem = await this.itemService.createItem({
          DataType: dropDownRowId,
          Object: tokenEl.Row_Type ? object : null,
        });

        // Associate the created item with the cell corresponding to the token's Row
        await this.cellService.createCell({
          Col: COLUMN_IDS.SHARED.ROW_TYPE,
          Row: tokenRow.Row,
          Items: [createdItem.Item],
        });
      }
    }
  }

  /**
   * Retrieves the row entity associated with a specific column name and value.
   *
   * This function searches for an item based on the provided column name and value.
   * If the item is found, it retrieves the associated cell and then fetches the row
   * entity linked to that cell. The function returns the row entity if found; otherwise, it returns undefined.
   *
   * @param {string} colName - The name of the column to search for the item.
   * @param {any} colValue - The value to search for in the specified column.
   * @returns {Promise<any | undefined>} - A promise that resolves to the row entity if found, or undefined if not.
   */
  private async getRowId(colName: string, colValue: any): Promise<any | undefined> {
    const item = await this.itemService.findOneByColumnName(colName, colValue);
    if (item) {
      const cell = await this.cellService.findOneByColumnName('Items', item.Item);
      if (cell.CellRow?.Row) {
        const rowEntity = await this.rowService.findOne(cell.CellRow.Row);
        return rowEntity;
      }
    }
  }

  /**
   * Reads data from a specified Excel sheet and returns the sheet data along with the column names.
   *
   * This function utilizes the `xlsx` library to read an Excel file and extract data from a specified sheet.
   * It allows for optional parameters to limit the number of rows read and to skip a certain number of initial rows.
   *
   * @param {string} filePath - The path to the Excel file.
   * @param {string} sheetName - The name of the sheet to read data from.
   * @param {Object} [options] - Optional parameters for reading the sheet.
   * @param {number} [options.sheetRows] - The maximum number of rows to read from the sheet. If not specified, all rows are read.
   * @param {number} [options.skipRows] - The number of rows to skip from the start of the sheet. Defaults to 0 if not specified.
   * @returns {{ sheetData: any[], sheetColumns: string[] }} - An object containing the sheet data as an array of rows
   *          and the column names as an array of strings.
   * @throws {Error} Throws an error if the specified sheet is not found in the workbook.
   */
  private readSheetData(filePath: string, sheetName: string, options?: { sheetRows?: number; skipRows?: number }): any {
    const workbook = XLSX.readFile(filePath);
    const workbookSheet = workbook.Sheets[sheetName];

    if (!workbookSheet) {
      throw new Error(`Sheet '${sheetName}' not found`);
    }

    const { sheetRows, skipRows } = options || {};
    let sheetData = XLSX.utils.sheet_to_json(workbookSheet, { header: 1, defval: null }).slice(skipRows);

    // Handle limiting rows
    if (sheetRows && sheetRows > 0) {
      sheetData = sheetData.slice(0, sheetRows);
    }

    let sheetColumns = XLSX.utils.sheet_to_json(workbookSheet, { header: 1, defval: null }).slice(2);
    if (Array.isArray(sheetColumns[0])) {
      const columns = (sheetColumns[0] as string[]).map((column) => (column ? column.replace('*', '') : column));
      sheetColumns = columns;
    } else {
      sheetColumns = [];
    }
    return { sheetData, sheetColumns };
  }

  /**
   * Extracts column header values from the specified index in the sheet data.
   *
   * This function filters rows in the provided sheet data to find non-null values
   * at the specified index, returning them as an array of strings.
   *
   * @param {any[]} sheetData - The data of the sheet as an array of rows.
   * @param {number} index - The index of the column from which to extract header values.
   * @returns {string[]} An array of non-null values from the specified column index.
   */
  private extractColHeaderValue(sheetData: any[], index: number): string[] {
    return sheetData.filter((row) => row.length > 0 && row[index] !== null).map((row) => row[index]);
  }

  /**
   * Checks if all elements in the given array are null.
   *
   * This function evaluates the provided array and returns true if every element
   * is null; otherwise, it returns false.
   *
   * @param {any[]} arr - The array to check for null values.
   * @returns {boolean} True if all elements are null, false otherwise.
   */
  private isAllNull(arr: any[]): boolean {
    return arr.every((element) => element === null);
  }

  /**
   * Checks if the given value is a semicolon-separated string.
   *
   * This function verifies that the input value is a string and contains more than
   * one part when split by semicolons. It also ensures that none of the parts are empty.
   *
   * @param {string} value - The value to check for semicolon separation.
   * @returns {boolean} True if the value is a semicolon-separated string with non-empty parts, false otherwise.
   */
  private isSemicolonSeparated(value: string): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    const parts = value.split(';');
    return parts.length > 1 && parts.every((part) => part.trim() !== '');
  }
}
