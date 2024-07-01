import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PageService } from '../page/page.service';
import { RowService } from '../row/row.service';
import { ColService } from '../col/col.service';
import { CellService } from '../cell/cell.service';
import { ItemService } from '../item/item.service';
import { FormatService } from '../format/format.service';
import {
    TOKEN_CONSTANTS,
    COL_DATA_TYPES,
    SYSTEM_INITIAL,
    STATUSES,
    COLUMN_NAMES,
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
    ) {}

    async importSheet(filePath: string) {

        // const pageWorkbook = XLSX.readFile(filePath, { sheetRows: 18 });
        // const allPagesWorkbook = pageWorkbook.Sheets['All Pages'];
        // const allPagesSheetData = this.readSheetData(allPagesWorkbook);

        // const pageIds = this.extractColHeaderValue(allPagesSheetData, 1);
        // await this.insertRecordIntotPG(pageIds);

        // const colWorkbook = XLSX.readFile(filePath);
        // const allColsWorkbook = colWorkbook.Sheets['All Cols'];
        // const allColsSheetData = this.readSheetData(allColsWorkbook);

        // const colIds = this.extractColHeaderValue(allColsSheetData, 2);
        // await this.insertRecordIntotCol(colIds);

        // await this.insertAllTokensData(filePath);
        // await this.insertAllPagesSheetData(filePath);
        // await this.insertAllColsSheetData(filePath);
        // await this.insertAllLanguagesSheetData(filePath);
        // await this.insertAllRegionsSheetData(filePath);
        const supplier = await this.insertAllSuppliersSheetData(filePath);

        return supplier;
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

    private async insertAllPagesSheetData(filePath: string) {
        const pageWorkbook = XLSX.readFile(filePath, { sheetRows: 18 });
        const allPagesWorkbook = pageWorkbook.Sheets['All Pages'];
        const allPagesSheetData = this.readSheetData(allPagesWorkbook);

        const filteredAllPagesData = allPagesSheetData.filter(
            (row) => !this.isAllNull(row),
        );

        const validPagesColumns = filteredAllPagesData[0].map((_, colIndex) =>
            filteredAllPagesData.some((row) => row[colIndex] !== null),
        );

        const filteredPagesData = filteredAllPagesData.map((row) =>
            row.filter((_, colIndex) => validPagesColumns[colIndex]),
        );

        const allPagesSheetColumns = this.getSheetColumns(allPagesWorkbook);
        const filteredPagesColumns = allPagesSheetColumns
            .filter((colName) => colName !== null)
            .map((colName) => colName.trim())
            .filter((colName) => colName !== '')
            .map((colName) => colName.replace(/\s+/g, '_'));

        const pagesData: any = filteredPagesData.map((row) =>
            filteredPagesColumns.reduce((acc, colName, index) => {
                acc[colName] = row[index];
                return acc;
            }, {}),
        );
        for (const pageEl of pagesData) {
            const page = await this.pageService.findOne(pageEl.Page_ID);
            const createdRow = await this.rowService.createRow({
                Row: pageEl.Row,
                PG: page.PG,
                RowLevel: 1,
                RowType: TOKEN_CONSTANTS.ROW_TYPE,
                Status: STATUSES[pageEl.Page_Status],
            });
            // PG Format
            await this.formatService.createFormat({
                User: SYSTEM_INITIAL.USER_ID,
                ObjectType: COL_DATA_TYPES.Page_ID,
                Object: page.PG,
                Owner: SYSTEM_INITIAL.USER_ID,
                Status: pageEl.Page_Status
                    ? this.isSemicolonSeparated(pageEl.Page_Status)
                        ? pageEl.Page_Status.split(';').map(
                              (status) =>
                                  STATUSES[
                                      status
                                          .trim()
                                          .toUpperCase()
                                          .replace(/\s+/g, '_')
                                  ],
                          )
                        : [
                              STATUSES[
                                  pageEl.Page_Status.trim()
                                      .toUpperCase()
                                      .replace(/\s+/g, '_')
                              ],
                          ]
                    : null,
                Comment: pageEl.Page_Comment
                    ? { [SYSTEM_INITIAL.ENGLISH]: pageEl.Page_Comment }
                    : null,
            });
            // Row Format
            await this.formatService.createFormat({
                User: SYSTEM_INITIAL.USER_ID,
                ObjectType: COL_DATA_TYPES.Row_ID,
                Object: createdRow.Row,
                Owner: SYSTEM_INITIAL.USER_ID,
            });
            if (COLUMN_NAMES.Page_ID in pageEl) {
                const createdItem = await this.itemService.createItem({
                    DataType: COL_DATA_TYPES.Page_ID,
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
                    DataType: COL_DATA_TYPES.ML_Text,
                    JSON: { 3000000100: pageEl.Page_Name },
                });
                await this.cellService.createCell({
                    Col: 2000000038,
                    Row: createdRow.Row,
                    Items: [createdItem.Item],
                });
            }
            if (COLUMN_NAMES.Page_Type in pageEl) {
                const createdItem = await this.itemService.createItem({
                    DataType: COL_DATA_TYPES.Drop_Down,
                    Object: 3000000328,
                });
                await this.cellService.createCell({
                    Col: 2000000039,
                    Row: createdRow.Row,
                    Items: [createdItem.Item],
                });
            }
            if (COLUMN_NAMES.Page_Edition in pageEl) {
                const createdItem = await this.itemService.createItem({
                    DataType: COL_DATA_TYPES.Drop_Down,
                    Object: 3000000334,
                });
                await this.cellService.createCell({
                    Col: 2000000040,
                    Row: createdRow.Row,
                    Items: [createdItem.Item],
                });
            }
            if (COLUMN_NAMES.Page_URL in pageEl) {
                const createdItem = await this.itemService.createItem({
                    DataType: COL_DATA_TYPES.URL,
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
                            DataType: COL_DATA_TYPES.ML_Text,
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
        }
    }

    private async insertAllColsSheetData(filePath: string) {
        const colWorkbook = XLSX.readFile(filePath);
        const allColsWorkbook = colWorkbook.Sheets['All Cols'];
        const allColsSheetData = this.readSheetData(allColsWorkbook);

        const filteredAllColsData = allColsSheetData.filter(
            (row) => !this.isAllNull(row),
        );

        const validColsColumns = filteredAllColsData[0].map((_, colIndex) =>
            filteredAllColsData.some((row) => row[colIndex] !== null),
        );

        const filteredColsData = filteredAllColsData.map((row) =>
            row.filter((_, colIndex) => validColsColumns[colIndex]),
        );

        const allPagesSheetColumns = this.getSheetColumns(allColsWorkbook);
        const filteredColsColumns = allPagesSheetColumns
            .filter((colName) => colName !== null)
            .map((colName) => colName.trim())
            .filter((colName) => colName !== '')
            .map((colName) => colName.replace(/[\s-]+/g, '_'));

        const colsData: any = filteredColsData.map((row) =>
            filteredColsColumns.reduce((acc, colName, index) => {
                acc[colName] = row[index];
                return acc;
            }, {}),
        );

        for (const colEl of colsData) {
            const col = await this.colService.findOne(colEl.Col_ID);
            // Col Format
            await this.formatService.createFormat({
                User: SYSTEM_INITIAL.USER_ID,
                ObjectType: COL_DATA_TYPES.Col_ID,
                Object: col.Col,
                Owner: SYSTEM_INITIAL.USER_ID,
                Status: colEl.Col_Status
                    ? this.isSemicolonSeparated(colEl.Col_Status)
                        ? colEl.Col_Status.split(';').map(
                              (status) =>
                                  STATUSES[
                                      status
                                          .trim()
                                          .toUpperCase()
                                          .replace(/\s+/g, '_')
                                  ],
                          )
                        : [
                              STATUSES[
                                  colEl.Col_Status.trim()
                                      .toUpperCase()
                                      .replace(/\s+/g, '_')
                              ],
                          ]
                    : null,
                Formula: colEl.Col_Formula
                    ? { 3000000380: colEl.Col_Formula }
                    : null,
                Comment: colEl.Col_Comment
                    ? { [SYSTEM_INITIAL.ENGLISH]: colEl.Col_Comment }
                    : null,
            });
            const createdRow = await this.rowService.createRow({
                Row: colEl.Row,
                PG: SYSTEM_INITIAL.ALL_COLS,
                RowLevel: 1,
                RowType: TOKEN_CONSTANTS.COL_ROW,
                Status: [STATUSES.SYSTEM],
            });
            // Row Format
            await this.formatService.createFormat({
                User: SYSTEM_INITIAL.USER_ID,
                ObjectType: COL_DATA_TYPES.Row_ID,
                Object: createdRow.Row,
                Owner: SYSTEM_INITIAL.USER_ID,
                Status: [STATUSES.SYSTEM],
            });

            if (COLUMN_NAMES.Page_Type in colEl) {
                const createdItem = await this.itemService.createItem({
                    DataType: COL_DATA_TYPES.Drop_Down,
                    Object: 3000000327,
                });
                await this.cellService.createCell({
                    Col: 2000000047,
                    Row: createdRow.Row,
                    Items: [createdItem.Item],
                });
            }

            if (COLUMN_NAMES.Page_ID in colEl) {
                const createdItem = await this.itemService.createItem({
                    DataType: COL_DATA_TYPES.Page_ID,
                    Object: colEl.Page_ID ? colEl.Page_ID : null,
                });
                await this.cellService.createCell({
                    Col: 2000000048,
                    Row: createdRow.Row,
                    Items: [createdItem.Item],
                });
            }

            if (COLUMN_NAMES.Col_Name in colEl) {
                const createdItem = await this.itemService.createItem({
                    DataType: COL_DATA_TYPES.ML_Text,
                    JSON: { [SYSTEM_INITIAL.ENGLISH]: colEl.Col_Name },
                });
                await this.cellService.createCell({
                    Col: 2000000049,
                    Row: createdRow.Row,
                    Items: [createdItem.Item],
                });
            }
            if (COLUMN_NAMES.Col_Data_Type in colEl) {
                const createdItem = await this.itemService.createItem({
                    DataType: COL_DATA_TYPES.Drop_Down,
                    Object: COL_DATA_TYPES[
                        colEl.Col_Data_Type.trim().replace(/[-\s]/g, '_')
                    ],
                });
                await this.cellService.createCell({
                    Col: 2000000050,
                    Row: createdRow.Row,
                    Items: [createdItem.Item],
                });
            }
            if (COLUMN_NAMES.Col_DropDown_Source in colEl) {
                const createdItem = await this.itemService.createItem({
                    DataType: COL_DATA_TYPES.DropDown_Source,
                    JSON: { 3000000375: 3000000338 },
                });
                await this.cellService.createCell({
                    Col: 2000000051,
                    Row: createdRow.Row,
                    Items: [createdItem.Item],
                });
            }
        }
    }

    private async insertAllTokensData(filePath: string) {
        const tokenWorkbook = XLSX.readFile(filePath);
        const allTokensWorkbook = tokenWorkbook.Sheets['All Tokens'];
        const allTokensSheetData = this.readSheetData(allTokensWorkbook);
        const allTokenData = [];
        for (const [rowIndex, row] of allTokensSheetData.entries()) {
            allTokenData[rowIndex] = {
                row_id: row[0],
                token:
                    row[1] != null
                        ? row[1]
                        : row[2] != null
                          ? row[2]
                          : row[3] != null
                            ? row[3]
                            : row[4] != null
                              ? row[4]
                              : row[5],
                row_type: row[7] == null ? row[6] : row[7],
                row_comment: row[8] == null ? '' : row[8],
                row_level: await this.calculateRowLevel(row, 'All Tokens'),
            };
        }
        for (const token of allTokenData) {
            let createdRow = await this.rowService.findOne(token.row_id);
            if (!createdRow) {
                createdRow = await this.rowService.createRow({
                    Row: token.row_id,
                    RowLevel: token.row_level,
                });
            }

            for (const [key, val] of Object.entries(token)) {
                if (key == 'token' && val !== null) {
                    const createdItem = await this.itemService.createItem({
                        DataType: createdRow.Row,
                        JSON: { 3000000100: val },
                    });
                    await this.cellService.createCell({
                        Col: 2000000077,
                        Row: createdRow.Row,
                        Items: [createdItem.Item],
                    });
                }
            }

            await this.formatService.createFormat({
                User: SYSTEM_INITIAL.USER_ID,
                ObjectType: createdRow.Row,
                Object: createdRow.Row,
                Owner: SYSTEM_INITIAL.USER_ID,
                Comment: token.row_comment
                    ? { 3000000100: token.row_comment }
                    : null,
            });
        }
        await this.updateRowType(allTokenData);
        // await this.updateItemDataType();
        await this.populateSiblingRowColumn();
        await this.populateParentRowColumn();
    }

    private async calculateRowLevel(
        rowArray: Array<any>,
        sheetName?: string,
    ): Promise<number> {
        //console.log('Row in Calculate Level: ', rowArray)
        if (sheetName && sheetName == 'All Tokens') {
            if (rowArray[1]) {
                return 1;
            } else if (rowArray[2]) {
                return 2;
            } else if (rowArray[3]) {
                return 3;
            } else if (rowArray[4]) {
                return 4;
            } else if (rowArray[5]) {
                return 5;
            }
        } else {
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
        const allTokens = await this.rowService.findAllOrderByIdAsc();
        let outerIndex = 0;
        allTokens.forEach(async (outerRow) => {
            outerIndex++;
            let innerIndex = outerIndex;
            while (innerIndex < allTokens.length) {
                if (outerRow.RowLevel > allTokens[innerIndex].RowLevel) {
                    break;
                }
                if (
                    outerRow.RowLevel === allTokens[innerIndex].RowLevel &&
                    outerRow.Row != allTokens[innerIndex].Row &&
                    outerRow.Row < allTokens[innerIndex].Row
                ) {
                    await this.rowService.updateRow(outerRow.Row, {
                        SiblingRow: allTokens[innerIndex],
                    });
                    break;
                }
                innerIndex++;
            }
        });
    }

    public async populateParentRowColumn() {
        const allTokens = await this.rowService.findAllOrderByIdDesc();
        let outerIndex = 0;
        allTokens.forEach(async (outerRow) => {
            outerIndex++;
            let innerIndex = outerIndex;
            while (innerIndex < allTokens.length) {
                if (outerRow.RowLevel < allTokens[innerIndex].RowLevel) {
                    break;
                }
                if (
                    outerRow.Row != allTokens[innerIndex].Row &&
                    outerRow.Row > allTokens[innerIndex].Row &&
                    outerRow.RowLevel > allTokens[innerIndex].RowLevel
                ) {
                    await this.rowService.updateRow(outerRow.Row, {
                        ParentRow: allTokens[innerIndex],
                    });
                    break;
                }
                innerIndex++;
            }
        });
    }

    private async insertAllLanguagesSheetData(filePath: string) {
        const languagesWorkbook = XLSX.readFile(filePath);
        const allLanguagesWorkbook = languagesWorkbook.Sheets['All Languages'];
        const allLanguagesSheetData = this.readSheetData(allLanguagesWorkbook);

        const filteredAllLanguagesData = allLanguagesSheetData.filter(
            (row) => !this.isAllNull(row),
        );

        const updatedLanguagesData = filteredAllLanguagesData.map((row) => {
            if (row[0] !== null) {
                row[0] = null;
                row[1] = 'All Languages';
            }
            return row;
        });

        const validLanguagesColumns = updatedLanguagesData[0].map(
            (_, colIndex) =>
                updatedLanguagesData.some((row) => row[colIndex] !== null),
        );

        const filteredLanguagesData = updatedLanguagesData.map((row) =>
            row.filter((_, colIndex) => validLanguagesColumns[colIndex]),
        );

        const allLanguagesSheetColumns =
            this.getSheetColumns(allLanguagesWorkbook);
        const filteredLanguagesColumns = allLanguagesSheetColumns
            .filter((colName) => colName !== null)
            .map((colName) => colName.trim())
            .filter((colName) => colName !== '')
            .map((colName) => colName.replace(/[\s-]+/g, '_'));

        const languagesData: any = filteredLanguagesData.map((row) =>
            filteredLanguagesColumns.reduce((acc, colName, index) => {
                acc[colName] = row[index];
                return acc;
            }, {}),
        );
        for (const langEL of languagesData) {
            let nextRowPk = 0;
            const lastRowInserted =
                await this.rowService.getLastInsertedRecord();
            nextRowPk = +lastRowInserted.Row + 1;
            const createdRow = await this.rowService.createRow({
                Row: nextRowPk,
                RowLevel: 1,
                RowType: langEL.Row_Type
                    ? TOKEN_CONSTANTS[
                          langEL.Row_Type.trim()
                              .toUpperCase()
                              .replace(/\s+/g, '_')
                              .replace(/-/g, '_')
                      ]
                    : null,
            });

            if (COLUMN_NAMES.LANGUAGE in langEL) {
                const createdItem = await this.itemService.createItem({
                    DataType: COL_DATA_TYPES.ML_Text,
                    JSON: { [SYSTEM_INITIAL.ENGLISH]: langEL.LANGUAGE },
                });
                await this.cellService.createCell({
                    Col: 2000000086,
                    Row: createdRow.Row,
                    Items: [createdItem.Item],
                });
            }

            // Row Format
            await this.formatService.createFormat({
                User: SYSTEM_INITIAL.USER_ID,
                ObjectType: COL_DATA_TYPES.Row_ID,
                Object: createdRow.Row,
                Owner: SYSTEM_INITIAL.USER_ID,
                Comment: langEL.Row_Comment
                    ? { [SYSTEM_INITIAL.ENGLISH]: langEL.Row_Comment }
                    : null,
            });
        }
    }

    private async insertAllRegionsSheetData(filePath: string){
        const regionsWorkbook = XLSX.readFile(filePath);
        const allRegionsWorkbook = regionsWorkbook.Sheets['All Regions'];
        const allRegionsSheetData = this.readSheetData(allRegionsWorkbook);

        const filteredAllRegionsData = allRegionsSheetData.filter(
            (row) => !this.isAllNull(row),
        );

        const allRegionsData = [];
        for (const [rowIndex, row] of filteredAllRegionsData.entries()) {
            allRegionsData[rowIndex] = {
                Region:
                    row[1] != null
                    ? row[1]
                    : row[2] != null
                    ? row[2]
                    : row[3] != null
                        ? row[3]
                        : row[4] != null
                        ? row[4]
                        : row[5],
                Row_Type: row[7] == null ? row[6] : row[7],
                Row_Comment: row[8] == null ? '' : row[8],
                Row_Level: await this.calculateRowLevel(row),
            };
        }

        for (const regionEl of allRegionsData) {
            let nextRowPk = 0;
            const lastRowInserted =
                await this.rowService.getLastInsertedRecord();
            nextRowPk = +lastRowInserted.Row + 1;
            const createdRow = await this.rowService.createRow({
                Row: nextRowPk,
                RowLevel: regionEl.Row_Level,
                RowType: regionEl.Row_Type
                    ? TOKEN_CONSTANTS[regionEl.Row_Type.trim()]
                    : null,
            });

            if (COLUMN_NAMES.REGION in regionEl) {
                const createdItem = await this.itemService.createItem({
                    DataType: COL_DATA_TYPES.ML_Text,
                    JSON: { [SYSTEM_INITIAL.ENGLISH]: regionEl.REGION },
                });
                await this.cellService.createCell({
                    Col: 2000000087,
                    Row: createdRow.Row,
                    Items: [createdItem.Item],
                });
            }

            // Row Format
            await this.formatService.createFormat({
                User: SYSTEM_INITIAL.USER_ID,
                ObjectType: COL_DATA_TYPES.Row_ID,
                Object: createdRow.Row,
                Owner: SYSTEM_INITIAL.USER_ID,
                Comment: regionEl.Row_Comment
                    ? { [SYSTEM_INITIAL.ENGLISH]: regionEl.Row_Comment }
                    : null,
            });
        }

        await this.populateSiblingRowColumn();
        await this.populateParentRowColumn();
    }

    private async insertAllSuppliersSheetData(filePath: string) {
        const suppliersWorkbook = XLSX.readFile(filePath);
        const allSuppliersWorkbook = suppliersWorkbook.Sheets['All Suppliers'];
        const allSuppliersSheetData = this.readSheetData(allSuppliersWorkbook);

        const filteredAllSuppliersData = allSuppliersSheetData.filter(
            (row) => !this.isAllNull(row),
        );

        const allSuppliersData = [];
        for (const [rowIndex, row] of filteredAllSuppliersData.entries()) {
            allSuppliersData[rowIndex] = {
                Supplier:
                    row[1] != null
                    ? row[1]
                    : row[2] != null
                    ? row[2]
                    : row[3] != null
                        ? row[3]
                        : row[4] != null
                        ? row[4]
                        : row[5],
                Row_Type: row[7] == null ? row[6] : row[7],
                Row_Comment: row[8] == null ? '' : row[8],
                Row_Level: await this.calculateRowLevel(row),
            };
        }

        for (const regionEl of allSuppliersData) {
            let nextRowPk = 0;
            const lastRowInserted =
                await this.rowService.getLastInsertedRecord();
            nextRowPk = +lastRowInserted.Row + 1;
            const createdRow = await this.rowService.createRow({
                Row: nextRowPk,
                RowLevel: regionEl.Row_Level,
                RowType: regionEl.Row_Type
                    ? TOKEN_CONSTANTS[regionEl.Row_Type.trim()]
                    : null,
            });

            if (COLUMN_NAMES.REGION in regionEl) {
                const createdItem = await this.itemService.createItem({
                    DataType: COL_DATA_TYPES.ML_Text,
                    JSON: { [SYSTEM_INITIAL.ENGLISH]: regionEl.REGION },
                });
                await this.cellService.createCell({
                    Col: 2000000087,
                    Row: createdRow.Row,
                    Items: [createdItem.Item],
                });
            }

            // Row Format
            await this.formatService.createFormat({
                User: SYSTEM_INITIAL.USER_ID,
                ObjectType: COL_DATA_TYPES.Row_ID,
                Object: createdRow.Row,
                Owner: SYSTEM_INITIAL.USER_ID,
                Comment: regionEl.Row_Comment
                    ? { [SYSTEM_INITIAL.ENGLISH]: regionEl.Row_Comment }
                    : null,
            });
        }

        await this.populateSiblingRowColumn();
        await this.populateParentRowColumn();
    }

    private async updateRowType(tokenData: any[]) {
        for (const token of tokenData) {
            if (token.row_type) {
                const item = await this.itemService.findOneByColumnName(
                    'JSON',
                    token.row_type,
                );
                if (item) {
                    const cell = await this.cellService.findOneByColumnName(
                        'Items',
                        item.Item,
                    );
                    if (cell.Row?.Row) {
                        const rowEntity = await this.rowService.findOne(
                            cell.Row.Row,
                        );
                        await this.rowService.updateRow(token.row_id, {
                            RowType: rowEntity,
                        });
                    }
                }
            }
        }
    }

    private async updateItemDataType() {
        const MLTextItem = await this.itemService.findOneByColumnName(
            'JSON',
            'ML-Text',
        );
        if (MLTextItem) {
            const items = await this.itemService.findAll();
            for (const item of items) {
                const cell = await this.cellService.findOneByColumnName(
                    'Items',
                    MLTextItem.Item,
                );
                if (cell.Row?.Row) {
                    const rowEntity = await this.rowService.findOne(
                        cell.Row.Row,
                    );
                    await this.itemService.updateItem(item.Item, {
                        DataType: rowEntity,
                    });
                }
            }
        }
    }

    private readSheetData(sheet: XLSX.WorkSheet): any[] {
        if (!sheet) {
            throw new Error('Sheet not found');
        }
        return XLSX.utils
            .sheet_to_json(sheet, { header: 1, defval: null })
            .slice(3);
    }

    private getSheetColumns(sheet: XLSX.WorkSheet): string[] {
        if (!sheet) {
            throw new Error('Sheet not found');
        }
        const sheetColumns = XLSX.utils
            .sheet_to_json(sheet, { header: 1, defval: null })
            .slice(2);
        if (Array.isArray(sheetColumns[0])) {
            const columns = (sheetColumns[0] as string[]).map((column) =>
                column ? column.replace('*', '') : column,
            );
            return columns;
        } else {
            return [];
        }
    }

    private extractColHeaderValue(sheetData: any[], index: number): string[] {
        return sheetData
            .filter((row) => row.length > 0 && row[index] !== null)
            .map((row) => row[index]);
    }

    private async findRowOfObjectType(allColsColumns: any[]) {
        const colNames = this.extractColHeaderValue(allColsColumns, 5);
        const colDataTypes = this.extractColHeaderValue(allColsColumns, 6);
        const uniqueColDataTypes = [...new Set(colDataTypes)];
        return uniqueColDataTypes;
    }

    private isAllNull(arr) {
        return arr.every((element) => element === null);
    }

    private findColNames(allColsColumns: any[]) {
        return this.extractColHeaderValue(allColsColumns, 6);
    }

    private isSemicolonSeparated(value: string) {
        if (typeof value !== 'string') {
            return false;
        }
        const parts = value.split(';');
        return parts.length > 1 && parts.every((part) => part.trim() !== '');
    }
}
