import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PageService } from '../page/page.service';
import { RowService } from '../row/row.service';
import { ColService } from '../col/col.service';
import { CellService } from '../cell/cell.service';
import { ItemService } from '../item/item.service';
import { FormatService } from '../format/format.service';
import { UserService } from '../user/user.service';
import { SYSTEM_INITIAL, COLUMN_NAMES, SHEET_NAMES, SHEET_READ_OPTIONS, SECTION_HEAD } from '../../constants';

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

  async importSheet(filePath: string) {
    const { sheetData: allPagesSheetData, sheetColumns: allPagesSheetColumns } = this.readSheetData(
      filePath,
      SHEET_NAMES.ALL_PAGES,
      SHEET_READ_OPTIONS.ALL_PAGES,
    );
    const { sheetData: allColsSheetData, sheetColumns: allColsSheetColumns } = this.readSheetData(
      filePath,
      SHEET_NAMES.ALL_COLS,
      SHEET_READ_OPTIONS.ALL_COLS,
    );
    const { sheetData: allTokensSheetData } = this.readSheetData(
      filePath,
      SHEET_NAMES.ALL_TOKENS,
      SHEET_READ_OPTIONS.ALL_TOKENS,
    );
    const { sheetData: allLanguagesSheetData, sheetColumns: allLanguagesSheetColumns } = this.readSheetData(
      filePath,
      SHEET_NAMES.ALL_LANGUAGES,
      SHEET_READ_OPTIONS.ALL_LANGUAGES,
    );
    const { sheetData: allRegionsSheetData } = this.readSheetData(
      filePath,
      SHEET_NAMES.ALL_REGIONS,
      SHEET_READ_OPTIONS.ALL_REGIONS,
    );
    const { sheetData: allSuppliersSheetData } = this.readSheetData(
      filePath,
      SHEET_NAMES.ALL_SUPPLIERS,
      SHEET_READ_OPTIONS.ALL_SUPPLIERS,
    );
    const { sheetData: allModelsSheetData } = this.readSheetData(
      filePath,
      SHEET_NAMES.ALL_MODELS,
      SHEET_READ_OPTIONS.ALL_MODELS,
    );
    const { sheetData: allUnitsSheetData } = this.readSheetData(
      filePath,
      SHEET_NAMES.ALL_UNITS,
      SHEET_READ_OPTIONS.ALL_UNITS,
    );
    const { sheetData: allLabelsSheetData } = this.readSheetData(
      filePath,
      SHEET_NAMES.ALL_LABELS,
      SHEET_READ_OPTIONS.ALL_LABELS,
    );

    const pageIds = this.extractColHeaderValue(allPagesSheetData, 1);
    await this.insertRecordIntotPG(pageIds);

    const colIds = this.extractColHeaderValue(allColsSheetData, 2);
    await this.insertRecordIntotCol(colIds);

    await this.insertAllTokensData(allTokensSheetData);
    await this.insertAllPagesSheetData(allPagesSheetData, allPagesSheetColumns);
    await this.insertAllColsSheetData(allColsSheetData, allColsSheetColumns);
    await this.insertAllLanguagesSheetData(allLanguagesSheetData, allLanguagesSheetColumns);
    await this.insertAllRegionsSheetData(allRegionsSheetData);
    await this.insertAllSuppliersSheetData(allSuppliersSheetData);
    await this.insertAllModelsSheetData(allModelsSheetData);
    await this.insertAllUnitsSheetData(allUnitsSheetData);
    await this.insertAllLabelsSheetData(allLabelsSheetData);

    await this.populateSiblingRowColumn();
    await this.populateParentRowColumn();

    return 'Data Imported Successfully!';
  }

  private async insertRecordIntotPG(pageIds: string[]) {
    for (const {} of pageIds) {
      await this.pageService.createPage();
    }
  }

  private async insertRecordIntotCol(colIds: string[]) {
    for (const {} of colIds) {
      await this.colService.createCol();
    }
  }

  private async insertAllPagesSheetData(sheetData: any[], sheetColumns: string[]) {
    const pagesData = await this.processSheetData(sheetData, sheetColumns);
    // Loop through each page element and process accordingly
    for (const pageEl of pagesData) {
      const page = await this.pageService.findOne(pageEl.Page_ID);
      const pageIdRowId = await this.getRowId('JSON', 'Page-ID');
      const dataTypeRowId = await this.getRowId('JSON', 'Row-ID');
      const systemRowId = await this.getRowId('JSON', 'System');
      const mlTextRowId = await this.getRowId('JSON', 'ML-Text');
      const dropDownRowId = await this.getRowId('JSON', 'Drop-Down');
      const urlRowId = await this.getRowId('JSON', 'URL');
      const pgRowId = await this.getRowId('JSON', 'PG-Row');
      const createdRow = await this.rowService.createRow({
        Row: pageEl.Row,
        PG: page.PG,
        RowLevel: 1,
      });
      // PG Format
      const statuses = await this.processStatus(pageEl, 'Page_Status');
      await this.formatService.createFormat({
        User: SYSTEM_INITIAL.USER_ID,
        ObjectType: pageIdRowId,
        Object: page.PG,
        Status: statuses,
        Comment: pageEl.Page_Comment ? { [SYSTEM_INITIAL.ENGLISH]: pageEl.Page_Comment } : null,
      });
      // Row Format
      await this.formatService.createFormat({
        User: SYSTEM_INITIAL.USER_ID,
        ObjectType: dataTypeRowId,
        Object: createdRow.Row,
        Owner: SYSTEM_INITIAL.USER_ID,
        Status: [systemRowId.Row],
      });
      if (COLUMN_NAMES.Page_ID in pageEl) {
        const createdItem = await this.itemService.createItem({
          DataType: pageIdRowId,
          Object: page.PG,
        });
        await this.cellService.createCell({
          Col: 2000000037,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }
      if (COLUMN_NAMES.Page_Name in pageEl) {
        const createdItem = await this.itemService.createItem({
          DataType: mlTextRowId,
          JSON: { 3000000100: pageEl.Page_Name },
        });
        await this.cellService.createCell({
          Col: 2000000038,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }
      if (COLUMN_NAMES.Page_Type in pageEl && COLUMN_NAMES.Page_Type != null) {
        const objectRowId = await this.getRowId('JSON', pageEl.Page_Type);
        if (objectRowId) {
          const createdItem = await this.itemService.createItem({
            DataType: dropDownRowId,
            Object: objectRowId.Row,
          });
          await this.cellService.createCell({
            Col: 2000000039,
            Row: createdRow.Row,
            Items: [createdItem.Item],
          });
        }
      }
      if (COLUMN_NAMES.Page_Edition in pageEl) {
        const objectRowId = await this.getRowId('JSON', pageEl.Page_Edition);
        const createdItem = await this.itemService.createItem({
          DataType: dropDownRowId,
          Object: objectRowId.Row,
        });
        await this.cellService.createCell({
          Col: 2000000040,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }
      if (COLUMN_NAMES.Page_URL in pageEl) {
        const createdItem = await this.itemService.createItem({
          DataType: urlRowId,
          JSON: {
            3000000396: `http://aic.com/${page.PG}/${pageEl.Page_Name}`,
          },
        });
        await this.cellService.createCell({
          Col: 2000000041,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }
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
            Col: 2000000042,
            Row: createdRow.Row,
            Items: itemIds,
          });
        }
      }
      if (COLUMN_NAMES.Row_Type in pageEl) {
        const createdItem = await this.itemService.createItem({
          DataType: dropDownRowId,
          Object: pgRowId.Row,
        });
        await this.cellService.createCell({
          Col: 2000000040,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }
    }
  }

  private async processStatus(el: any, key: string) {
    if (!el[key]) {
      return null;
    }

    const statuses = await (this.isSemicolonSeparated(el[key])
      ? Promise.all(el[key].split(';').map(async (status) => (await this.getRowId('JSON', status.trim()))?.Row))
      : [(await this.getRowId('JSON', el[key].trim()))?.Row]);
    return statuses;
  }

  private async processStringToRowIds(itemString: string) {
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

  private async insertAllColsSheetData(sheetData: any[], sheetColumns: string[]) {
    const colsData = await this.processSheetData(sheetData, sheetColumns);

    for (const colEl of colsData) {
      const col = await this.colService.findOne(colEl.Col_ID);
      const pageIdRowId = await this.getRowId('JSON', 'Page-ID');
      const colIdRowId = await this.getRowId('JSON', 'Col-ID');
      const rowId = await this.getRowId('JSON', 'Row-ID');
      const colStatuses = await this.processStatus(colEl, 'Col_Status');
      const rowStatuses = await this.processStatus(colEl, 'Row_Status');
      const mlTextRowId = await this.getRowId('JSON', 'ML-Text');
      const dropDownRowId = await this.getRowId('JSON', 'Drop-Down');
      const dropDownSourceRowId = await this.getRowId('JSON', 'DropDown-Source');
      const colRowRowId = await this.getRowId('JSON', 'Col-Row');
      // Col Format
      await this.formatService.createFormat({
        User: SYSTEM_INITIAL.USER_ID,
        ObjectType: colIdRowId,
        Object: col.Col,
        Status: colStatuses,
        Formula: colEl.Col_Formula ? { 3000000380: colEl.Col_Formula } : null,
        Comment: colEl.Col_Comment ? { [SYSTEM_INITIAL.ENGLISH]: colEl.Col_Comment } : null,
      });
      const createdRow = await this.rowService.createRow({
        Row: colEl.Row,
        RowLevel: 1,
      });
      // Row Format
      await this.formatService.createFormat({
        User: SYSTEM_INITIAL.USER_ID,
        ObjectType: rowId,
        Object: createdRow.Row,
        Owner: SYSTEM_INITIAL.USER_ID,
        Status: rowStatuses,
      });

      if (COLUMN_NAMES.Page_Type in colEl && colEl.Page_Type != null) {
        const pageTypeObjectId = await this.getRowId('JSON', colEl.Page_Type);
        const createdItem = await this.itemService.createItem({
          DataType: dropDownRowId,
          Object: pageTypeObjectId.Row,
        });
        await this.cellService.createCell({
          Col: 2000000047,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }

      if (COLUMN_NAMES.Page_ID in colEl && colEl.Page_ID != null) {
        const createdItem = await this.itemService.createItem({
          DataType: pageIdRowId,
          Object: colEl.Page_ID,
        });
        await this.cellService.createCell({
          Col: 2000000048,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }

      if (COLUMN_NAMES.Col_Name in colEl && colEl.Col_Name != null) {
        const createdItem = await this.itemService.createItem({
          DataType: mlTextRowId,
          JSON: { [SYSTEM_INITIAL.ENGLISH]: colEl.Col_Name },
        });
        await this.cellService.createCell({
          Col: 2000000049,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }
      if (COLUMN_NAMES.Col_Data_Type in colEl && colEl.Col_Data_Type != null) {
        const colDataTypeObjectId = await this.getRowId('JSON', colEl.Col_Data_Type);
        const createdItem = await this.itemService.createItem({
          DataType: dropDownRowId,
          Object: colDataTypeObjectId.Row,
        });
        await this.cellService.createCell({
          Col: 2000000050,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }
      if (COLUMN_NAMES.Col_DropDown_Source in colEl && colEl.Col_DropDown_Source != null) {
        const colDropDownSourceJson = await this.getRowId('JSON', colEl.Col_DropDown_Source);
        if (colDropDownSourceJson) {
          const createdItem = await this.itemService.createItem({
            DataType: dropDownSourceRowId,
            JSON: { 3000000375: colDropDownSourceJson.Row },
          });
          await this.cellService.createCell({
            Col: 2000000051,
            Row: createdRow.Row,
            Items: [createdItem.Item],
          });
        }
      }
      if (COLUMN_NAMES.Row_Type in colEl && colEl.Row_Type != null) {
        const createdItem = await this.itemService.createItem({
          DataType: dropDownRowId,
          Object: colRowRowId.Row,
        });
        await this.cellService.createCell({
          Col: 2000000004,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }
    }
  }

  private async processSheetData(sheetData: any[], sheetColumns: string[]) {
    const filteredData = sheetData.filter((row) => !this.isAllNull(row));

    const validColumns = filteredData[0].map((_, colIndex) => filteredData.some((row) => row[colIndex] !== null));

    const filteredRows = filteredData.map((row) => row.filter((_, colIndex) => validColumns[colIndex]));

    const filteredColumns = sheetColumns
      .filter((colName) => colName !== null)
      .map((colName) => colName.trim())
      .filter((colName) => colName !== '')
      .map((colName) => colName.replace(/[\s-]+/g, '_'));

    const processedData: any = filteredRows.map((row) =>
      filteredColumns.reduce((acc, colName, index) => {
        acc[colName] = row[index];
        return acc;
      }, {}),
    );
    return processedData;
  }

  private async insertAllTokensData(sheetData: any[]) {
    const allTokenData = [];
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
    for (const tokenEl of allTokenData) {
      let createdRow = await this.rowService.findOne(tokenEl.Row);
      if (!createdRow) {
        createdRow = await this.rowService.createRow({
          Row: tokenEl.Row,
          RowLevel: tokenEl.Row_Status == SECTION_HEAD ? 0 : tokenEl.Row_level,
        });
      }
      if (COLUMN_NAMES.TOKEN in tokenEl) {
        const createdItem = await this.itemService.createItem({
          DataType: createdRow.Row,
          JSON: { 3000000100: tokenEl.TOKEN },
        });
        await this.cellService.createCell({
          Col: 2000000077,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }
    }
    await this.insertRecordIntoUserTable();
    await this.rowFormatRecord(allTokenData);
    await this.updateRowType(allTokenData);
  }

  private async insertRecordIntoUserTable() {
    const userIdRowId = await this.getRowId('JSON', 'User-ID');
    await this.userService.createUser({
      User: 3000000099,
      UserType: userIdRowId,
    });
  }

  private async rowFormatRecord(allTokenData: any[]) {
    const objectTypeRowId = await this.getRowId('JSON', 'Row-ID');
    const sectionHeadRowId = await this.getRowId('JSON', 'Section-Head');
    for (const tokenEl of allTokenData) {
      const row = await this.rowService.findOne(tokenEl.Row);
      await this.formatService.createFormat({
        User: SYSTEM_INITIAL.USER_ID,
        ObjectType: objectTypeRowId,
        Object: row.Row,
        Owner: SYSTEM_INITIAL.USER_ID,
        Status: tokenEl.Row_Status ? [sectionHeadRowId.Row] : null,
        Comment: tokenEl.Row_Comment ? { 3000000100: tokenEl.Row_Comment } : null,
      });
    }
  }

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

  public async populateSiblingRowColumn() {
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

  public async populateParentRowColumn() {
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

  private async insertAllLanguagesSheetData(sheetData: any[], sheetColumns: string[]) {
    const languagesData = await this.processSheetData(sheetData, sheetColumns);

    const dataTypeRowId = await this.getRowId('JSON', 'Row-ID');
    const rowStatuses = await this.processStatus(languagesData[0], 'Row_Status');
    const mlTextRowId = await this.getRowId('JSON', 'ML-Text');
    for (const langEL of languagesData) {
      let nextRowPk = 0;
      const lastRowInserted = await this.rowService.getLastInsertedRecord();
      nextRowPk = +lastRowInserted.Row + 1;
      const createdRow = await this.rowService.createRow({
        Row: nextRowPk,
        RowLevel: langEL.Row_Status == SECTION_HEAD ? 0 : 1,
      });

      // Row Format
      await this.formatService.createFormat({
        User: SYSTEM_INITIAL.USER_ID,
        ObjectType: dataTypeRowId,
        Object: createdRow.Row,
        Owner: SYSTEM_INITIAL.USER_ID,
        Status: langEL.Row_Status ? rowStatuses : null,
        Comment: langEL.Row_Comment ? { [SYSTEM_INITIAL.ENGLISH]: langEL.Row_Comment } : null,
      });

      if (COLUMN_NAMES.Language in langEL && langEL.Language != null) {
        const createdItem = await this.itemService.createItem({
          DataType: mlTextRowId,
          JSON: { [SYSTEM_INITIAL.ENGLISH]: langEL.Language },
        });
        await this.cellService.createCell({
          Col: 2000000086,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }
      if (COLUMN_NAMES.Row_Type in langEL && langEL.Row_Type != null) {
        const defaultRowId = await this.getRowId('JSON', 'Default');
        const createdItem = await this.itemService.createItem({
          DataType: mlTextRowId,
          Object: defaultRowId.Row,
        });
        await this.cellService.createCell({
          Col: 2000000004,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }
    }
  }

  private async insertAllRegionsSheetData(sheetData: any[]) {
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

    const dataTypeRowId = await this.getRowId('JSON', 'Row-ID');
    const mlTextRowId = await this.getRowId('JSON', 'ML-Text');
    const rowStatuses = await this.processStatus(allRegionsData[0], 'Row_Status');
    for (const regionEl of allRegionsData) {
      let nextRowPk = 0;
      const lastRowInserted = await this.rowService.getLastInsertedRecord();
      nextRowPk = +lastRowInserted.Row + 1;
      const createdRow = await this.rowService.createRow({
        Row: nextRowPk,
        RowLevel: regionEl.Row_Status == SECTION_HEAD ? 0 : regionEl.Row_Level,
      });

      // Row Format
      await this.formatService.createFormat({
        User: SYSTEM_INITIAL.USER_ID,
        ObjectType: dataTypeRowId,
        Object: createdRow.Row,
        Owner: SYSTEM_INITIAL.USER_ID,
        Status: regionEl.Row_Status ? rowStatuses : null,
        Comment: regionEl.Row_Comment ? { [SYSTEM_INITIAL.ENGLISH]: regionEl.Row_Comment } : null,
      });

      if (COLUMN_NAMES.Region in regionEl && regionEl.Region != null) {
        const createdItem = await this.itemService.createItem({
          DataType: mlTextRowId,
          JSON: { [SYSTEM_INITIAL.ENGLISH]: regionEl.Region },
        });
        await this.cellService.createCell({
          Col: 2000000087,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }
      if (COLUMN_NAMES.Row_Type in regionEl && regionEl.Row_Type != null) {
        const rowTypeRowId = await this.getRowId('JSON', regionEl.Row_Type);
        const createdItem = await this.itemService.createItem({
          DataType: mlTextRowId,
          Object: rowTypeRowId.Row,
        });
        await this.cellService.createCell({
          Col: 2000000004,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }
    }
  }

  private async insertAllSuppliersSheetData(sheetData: any[]) {
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
    const dataTypeRowId = await this.getRowId('JSON', 'Row-ID');
    const mlTextRowId = await this.getRowId('JSON', 'ML-Text');
    const rowStatuses = await this.processStatus(allSuppliersData[0], 'Row_Status');

    for (const supplierEl of allSuppliersData) {
      let nextRowPk = 0;
      const lastRowInserted = await this.rowService.getLastInsertedRecord();
      nextRowPk = +lastRowInserted.Row + 1;
      const createdRow = await this.rowService.createRow({
        Row: nextRowPk,
        RowLevel: supplierEl.Row_Status == SECTION_HEAD ? 0 : supplierEl.Row_Level,
      });

      // Row Format
      await this.formatService.createFormat({
        User: SYSTEM_INITIAL.USER_ID,
        ObjectType: dataTypeRowId,
        Object: createdRow.Row,
        Owner: SYSTEM_INITIAL.USER_ID,
        Status: supplierEl.Row_Status ? rowStatuses : null,
        Comment: supplierEl.Row_Comment ? { [SYSTEM_INITIAL.ENGLISH]: supplierEl.Row_Comment } : null,
      });

      if (COLUMN_NAMES.Supplier in supplierEl && supplierEl.Supplier != null) {
        const createdItem = await this.itemService.createItem({
          DataType: mlTextRowId,
          JSON: { [SYSTEM_INITIAL.ENGLISH]: supplierEl.Supplier },
        });
        await this.cellService.createCell({
          Col: 2000000088,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }
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
            Col: 2000000004,
            Row: createdRow.Row,
            Items: itemIds,
          });
        }
      }
    }
  }

  private async insertAllModelsSheetData(sheetData: any[]) {
    const filteredAllModelsData = sheetData.filter((row) => !this.isAllNull(row));

    const allModelsData = [];
    for (const [rowIndex, row] of filteredAllModelsData.entries()) {
      allModelsData[rowIndex] = {
        Model: row.slice(0, 7).find((value) => value != null),
        Release_Date: row[8] ?? row[8],
        Row_Type: row[9] ?? row[9],
        Row_Status: row[10] ?? row[10],
        Row_Comment: row[11] ?? row[11],
        Row_Level: this.calculateRowLevel(row),
      };
    }
    const dataTypeRowId = await this.getRowId('JSON', 'Row-ID');
    const mlTextRowId = await this.getRowId('JSON', 'ML-Text');
    const dateRowId = await this.getRowId('JSON', 'Date');
    const rowStatuses = await this.processStatus(allModelsData[0], 'Row_Status');

    for (const modelEl of allModelsData) {
      let nextRowPk = 0;
      const lastRowInserted = await this.rowService.getLastInsertedRecord();
      nextRowPk = +lastRowInserted.Row + 1;
      const createdRow = await this.rowService.createRow({
        Row: nextRowPk,
        RowLevel: modelEl.Row_Status == SECTION_HEAD ? 0 : modelEl.Row_Level,
      });

      // Row Format
      await this.formatService.createFormat({
        User: SYSTEM_INITIAL.USER_ID,
        ObjectType: dataTypeRowId,
        Object: createdRow.Row,
        Owner: SYSTEM_INITIAL.USER_ID,
        Status: modelEl.Row_Status ? rowStatuses : null,
        Comment: modelEl.Row_Comment ? { [SYSTEM_INITIAL.ENGLISH]: modelEl.Row_Comment } : null,
      });

      if (COLUMN_NAMES.Model in modelEl && modelEl.Model != null) {
        const createdItem = await this.itemService.createItem({
          DataType: mlTextRowId,
          JSON: { [SYSTEM_INITIAL.ENGLISH]: modelEl.Model },
        });
        await this.cellService.createCell({
          Col: 2000000089,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }
      if (COLUMN_NAMES.Release_Date in modelEl && modelEl.Release_Date != null) {
        const createdItem = await this.itemService.createItem({
          DataType: dateRowId,
          DateTime: new Date(modelEl.Release_Date).toISOString(),
        });
        await this.cellService.createCell({
          Col: 2000000089,
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }
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
            Col: 2000000004,
            Row: createdRow.Row,
            Items: itemIds,
          });
        }
      }
    }
  }

  private async insertAllUnitsSheetData(sheetData: any[]) {
    const user = await this.userService.findOneUser(SYSTEM_INITIAL.USER_ID);

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
    for (const unitEl of allUnitsData) {
      let nextRowPk = 0;
      const lastRowInserted = await this.rowService.getLastInsertedRecord();
      nextRowPk = +lastRowInserted.Row + 1;

      const rowObjectRowId = await this.getRowId('JSON', 'Row');
      const mlTextRowId = await this.getRowId('JSON', 'ML-Text');
      const numberRowId = await this.getRowId('JSON', 'Number');
      const dropDownRowId = await this.getRowId('JSON', 'Drop-Down');
      const rowStatuses = await this.processStringToRowIds(unitEl.Row_Status);

      // Creating Row
      const createdRow = await this.rowService.createRow({
        Row: nextRowPk,
        RowLevel: unitEl.Row_Status == SECTION_HEAD ? 0 : unitEl.Row_Level,
      });
      // Row Format
      await this.formatService.createFormat({
        User: user.User,
        ObjectType: rowObjectRowId,
        Object: createdRow.Row,
        Owner: user.User,
        Status: unitEl.Row_Status ? rowStatuses : null,
        Comment: unitEl.Row_Comment ? { [SYSTEM_INITIAL.ENGLISH]: unitEl.Row_Comment } : null,
      });

      if (COLUMN_NAMES.Unit in unitEl && unitEl.Unit) {
        const createdItem = await this.itemService.createItem({
          DataType: mlTextRowId,
          JSON: { [SYSTEM_INITIAL.ENGLISH]: unitEl.Unit },
        });
        await this.cellService.createCell({
          Col: 2000000084, // Col-ID of "Unit"
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }

      if (COLUMN_NAMES.Unit_Factor in unitEl && unitEl.Unit_Factor) {
        const createdItem = await this.itemService.createItem({
          DataType: numberRowId,
          Num: unitEl.Unit_Factor,
        });
        await this.cellService.createCell({
          Col: 2000000085, // Col-ID of "Unit Factor"
          Row: createdRow.Row,
          Items: [createdItem.Item],
        });
      }

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
          Col: 2000000004, // Col-ID of "Row Type"
          Row: createdRow.Row,
          Items: createdItemIds,
        });
      }
    }
  }

  private async insertAllLabelsSheetData(sheetData: any[]) {
    const user = await this.userService.findOneUser(SYSTEM_INITIAL.USER_ID);
    const rowObjectRowId = await this.getRowId('JSON', 'Row');
    const dropDownRowId = await this.getRowId('JSON', 'Drop-Down');
    const dropDownSourceRowId = await this.getRowId('JSON', 'DropDown-Source');
    const mlTextRowId = await this.getRowId('JSON', 'ML-Text');
    const ddsTypeRowId = (await this.getRowId('JSON', 'DDS-Type')).Row; // DDS-Type as 3000000375
    const valueDataTypeRowId = await this.getRowId('JSON', 'Value Data-Type');
    const formulaRowId = await this.getRowId('JSON', 'Formula');
    const validateDataRowId = (await this.getRowId('JSON', 'Formula')).Row; // Validate Data as 3000000382

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
        Value_Data_Type: row[6] == null ? '' : row[6],
        Value_DropDown_Source: row[7] == null ? '' : row[7],
        Value_Default_Data: row[8] == null ? '' : row[8],
        Value_Status: row[9] == null ? '' : row[9],
        Value_Formula: row[10] == null ? '' : row[10],
        Row_Type: row[11] == null ? '' : row[11],
        Row_Status: row[12] == null ? '' : row[12],
        Row_Comment: row[13] == null ? '' : row[13],
        Row_Level: this.calculateRowLevel(row),
      };
    }

    for (const labelEl of allLabelsData) {
      let nextRowPk = 0;
      const lastRowInserted = await this.rowService.getLastInsertedRecord();
      nextRowPk = +lastRowInserted.Row + 1;
      const createdRow = await this.rowService.createRow({
        Row: nextRowPk,
        RowLevel: labelEl.Row_Status == SECTION_HEAD ? 0 : labelEl.Row_Level,
      });
      const createdFormat = await this.formatService.createFormat({
        User: user.User,
        ObjectType: rowObjectRowId,
        Object: createdRow.Row,
        Owner: user.User,
      });

      for (const [key, val] of Object.entries(labelEl)) {
        if (key == COLUMN_NAMES.Label && val) {
          const createdItem = await this.itemService.createItem({
            DataType: mlTextRowId,
            JSON: { [SYSTEM_INITIAL.ENGLISH]: val },
          });
          await this.cellService.createCell({
            Col: 2000000078, // Col-ID of "Label"
            Row: createdRow.Row,
            Items: [createdItem.Item],
          });
        } else if (key == COLUMN_NAMES.Value_Data_Type && val) {
          const objectRowId = await this.getRowId('JSON', val);
          if (objectRowId) {
            const createdItem = await this.itemService.createItem({
              DataType: dropDownRowId,
              Object: objectRowId.Row,
            });
            await this.cellService.createCell({
              Col: 2000000079, // Col-ID of "Value Data-Type"
              Row: createdRow.Row,
              Items: [createdItem.Item],
            });
          }
        } else if (key == COLUMN_NAMES.Value_DropDown_Source && val) {
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
            Col: 2000000080, // Col-ID of "Value DropDown-Source"
            Row: createdRow.Row,
            Items: createdItemIds,
          });
        } else if (key == COLUMN_NAMES.Value_Default_Data && val) {
          const colValues = String(val).split(';'); // Items, Not Row-IDs
          const createdItemIds = [];
          for (const value of colValues) {
            const createdItem = await this.itemService.createItem({
              DataType: valueDataTypeRowId,
              JSON: { [SYSTEM_INITIAL.ENGLISH]: value },
            });
            createdItemIds.push(createdItem.Item);
          }
          const createdCell = await this.cellService.createCell({
            Col: 2000000081, // Col-ID of "Value Default-Data"
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
            Col: 2000000081, // Col-ID of "Value_Status"
            Row: createdRow.Row,
            Items: createdItemIds,
          });
        } else if (key == COLUMN_NAMES.Value_Formula && val) {
          const createdItem = await this.itemService.createItem({
            DataType: formulaRowId,
            JSON: { [validateDataRowId]: val },
          });
          await this.cellService.createCell({
            Col: 2000000083, // Col-ID of "Value Formula"
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
            Col: 2000000004, // Col-ID of "Row Type"
            Row: createdRow.Row,
            Items: createdItemIds,
          });
        } else if (key == COLUMN_NAMES.Row_Status && val) {
          const statusesRowIds = await this.processStringToRowIds(val as string);
          await this.formatService.updateFormat(createdFormat.Format, { Status: statusesRowIds });
        } else if (key == COLUMN_NAMES.Row_Comment && val !== null) {
          await this.formatService.updateFormat(createdFormat.Format, { Comment: { [SYSTEM_INITIAL.ENGLISH]: val } });
        }
      }
    }
  }

  private async updateRowType(allTokenData: any[]) {
    const dropDownRowId = await this.getRowId('JSON', 'Drop-Down');
    const nodeRowId = await this.getRowId('JSON', 'Node');
    const defaultRowId = await this.getRowId('JSON', 'Default');
    for (const tokenEl of allTokenData) {
      const tokenRow = await this.rowService.findOne(tokenEl.Row);
      if (tokenEl.Row_Type != null) {
        const object = tokenEl.Row_Type == 'Node' ? nodeRowId.Row : defaultRowId.Row;
        const createdItem = await this.itemService.createItem({
          DataType: dropDownRowId,
          Object: tokenEl.Row_Type ? object : null,
        });
        await this.cellService.createCell({
          Col: 2000000004,
          Row: tokenRow.Row,
          Items: [createdItem.Item],
        });
      }
    }
  }

  private async getRowId(colName, colValue) {
    const item = await this.itemService.findOneByColumnName(colName, colValue);
    if (item) {
      const cell = await this.cellService.findOneByColumnName('Items', item.Item);
      if (cell.Row?.Row) {
        const rowEntity = await this.rowService.findOne(cell.Row.Row);
        return rowEntity;
      }
    }
  }

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

  private extractColHeaderValue(sheetData: any[], index: number): string[] {
    return sheetData.filter((row) => row.length > 0 && row[index] !== null).map((row) => row[index]);
  }

  private isAllNull(arr) {
    return arr.every((element) => element === null);
  }

  private isSemicolonSeparated(value: string) {
    if (typeof value !== 'string') {
      return false;
    }
    const parts = value.split(';');
    return parts.length > 1 && parts.every((part) => part.trim() !== '');
  }
}
