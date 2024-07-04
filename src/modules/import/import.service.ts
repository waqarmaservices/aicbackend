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
        private readonly userService: UserService,
    ) {}

    async importSheet(filePath: string) {
        const pageWorkbook = XLSX.readFile(filePath, { sheetRows: 18 });
        const allPagesWorkbook = pageWorkbook.Sheets['All Pages'];
        const allPagesSheetData = this.readSheetData(allPagesWorkbook);

        const pageIds = this.extractColHeaderValue(allPagesSheetData, 1);
        await this.insertRecordIntotPG(pageIds);

        const colWorkbook = XLSX.readFile(filePath);
        const allColsWorkbook = colWorkbook.Sheets['All Cols'];
        const allColsSheetData = this.readSheetData(allColsWorkbook);

        const colIds = this.extractColHeaderValue(allColsSheetData, 2);
        await this.insertRecordIntotCol(colIds);

        await this.insertAllTokensData(filePath);
        await this.insertAllPagesSheetData(filePath);
        await this.insertAllColsSheetData(filePath);
        await this.insertAllLanguagesSheetData(filePath);
        await this.insertAllRegionsSheetData(filePath);
        await this.insertAllSuppliersSheetData(filePath);
        await this.insertAllModelsSheetData(filePath);
        await this.insertAllUnitsSheetData(filePath);
        await this.insertAllLabelsSheetData(filePath);

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
                Comment: pageEl.Page_Comment
                    ? { [SYSTEM_INITIAL.ENGLISH]: pageEl.Page_Comment }
                    : null,
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
            if (
                COLUMN_NAMES.Page_Type in pageEl &&
                COLUMN_NAMES.Page_Type != null
            ) {
                const objectRowId = await this.getRowId(
                    'JSON',
                    pageEl.Page_Type,
                );
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
                const objectRowId = await this.getRowId(
                    'JSON',
                    pageEl.Page_Edition,
                );
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
            ? Promise.all(
                  el[key]
                      .split(';')
                      .map(
                          async (status) =>
                              (await this.getRowId('JSON', status.trim()))?.Row,
                      ),
              )
            : [(await this.getRowId('JSON', el[key].trim()))?.Row]);
        return statuses;
    }

    private async processStringToRowIds(itemString: string) {
        if (!itemString) {
            return null;
        }

        const rowIds = await (this.isSemicolonSeparated(itemString)
            ? Promise.all(
                  itemString
                      .split(';')
                      .map(
                          async (singleString) =>
                              (await this.getRowId('JSON', singleString.trim()))
                                  ?.Row,
                      ),
              )
            : [(await this.getRowId('JSON', itemString.trim()))?.Row]);
        return rowIds;
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
            const pageIdRowId = await this.getRowId('JSON', 'Page-ID');
            const colIdRowId = await this.getRowId('JSON', 'Col-ID');
            const rowId = await this.getRowId('JSON', 'Row-ID');
            const colStatuses = await this.processStatus(colEl, 'Col_Status');
            const rowStatuses = await this.processStatus(colEl, 'Row_Status');
            const mlTextRowId = await this.getRowId('JSON', 'ML-Text');
            const dropDownRowId = await this.getRowId('JSON', 'Drop-Down');
            const dropDownSourceRowId = await this.getRowId(
                'JSON',
                'DropDown-Source',
            );
            const colRowRowId = await this.getRowId('JSON', 'Col-Row');
            // Col Format
            await this.formatService.createFormat({
                User: SYSTEM_INITIAL.USER_ID,
                ObjectType: colIdRowId,
                Object: col.Col,
                Status: colStatuses,
                Formula: colEl.Col_Formula
                    ? { 3000000380: colEl.Col_Formula }
                    : null,
                Comment: colEl.Col_Comment
                    ? { [SYSTEM_INITIAL.ENGLISH]: colEl.Col_Comment }
                    : null,
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
                const pageTypeObjectId = await this.getRowId(
                    'JSON',
                    colEl.Page_Type,
                );
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
            if (
                COLUMN_NAMES.Col_Data_Type in colEl &&
                colEl.Col_Data_Type != null
            ) {
                const colDataTypeObjectId = await this.getRowId(
                    'JSON',
                    colEl.Col_Data_Type,
                );
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
            if (
                COLUMN_NAMES.Col_DropDown_Source in colEl &&
                colEl.Col_DropDown_Source != null
            ) {
                const colDropDownSourceJson = await this.getRowId(
                    'JSON',
                    colEl.Col_DropDown_Source,
                );
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

    private async insertAllTokensData(filePath: string) {
        const tokenWorkbook = XLSX.readFile(filePath);
        const allTokensWorkbook = tokenWorkbook.Sheets['All Tokens'];
        const allTokensSheetData = this.readSheetData(allTokensWorkbook);
        const allTokenData = [];
        for (const [rowIndex, row] of allTokensSheetData.entries()) {
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
                    RowLevel: tokenEl.Row_level,
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
        await this.populateSiblingRowColumn();
        await this.populateParentRowColumn();
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
                Comment: tokenEl.Row_Comment
                    ? { 3000000100: tokenEl.Row_Comment }
                    : null,
            });
        }
    }

    private calculateRowLevel(
        rowArray: Array<any>,
        sheetName?: string,
    ): number {
        if (sheetName) {
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

        const validLanguagesColumns = filteredAllLanguagesData[0].map(
            (_, colIndex) =>
                filteredAllLanguagesData.some((row) => row[colIndex] !== null),
        );

        const filteredLanguagesData = filteredAllLanguagesData.map((row) =>
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
        const dataTypeRowId = await this.getRowId('JSON', 'Row-ID');
        const rowStatuses = await this.processStatus(
            languagesData[0],
            'Row_Status',
        );
        const mlTextRowId = await this.getRowId('JSON', 'ML-Text');
        for (const langEL of languagesData) {
            let nextRowPk = 0;
            const lastRowInserted =
                await this.rowService.getLastInsertedRecord();
            nextRowPk = +lastRowInserted.Row + 1;
            const createdRow = await this.rowService.createRow({
                Row: nextRowPk,
                RowLevel: 1,
            });

            // Row Format
            await this.formatService.createFormat({
                User: SYSTEM_INITIAL.USER_ID,
                ObjectType: dataTypeRowId,
                Object: createdRow.Row,
                Owner: SYSTEM_INITIAL.USER_ID,
                Status: langEL.Row_Status ? rowStatuses : null,
                Comment: langEL.Row_Comment
                    ? { [SYSTEM_INITIAL.ENGLISH]: langEL.Row_Comment }
                    : null,
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

    private async insertAllRegionsSheetData(filePath: string) {
        const regionsWorkbook = XLSX.readFile(filePath);
        const allRegionsWorkbook = regionsWorkbook.Sheets['All Regions'];
        const allRegionsSheetData = this.readSheetData(allRegionsWorkbook);

        const filteredAllRegionsData = allRegionsSheetData.filter(
            (row) => !this.isAllNull(row),
        );

        const allRegionsData = [];
        for (const [rowIndex, row] of filteredAllRegionsData.entries()) {
            allRegionsData[rowIndex] = {
                Region: row.slice(0, 6).find((value) => value != null),
                Row_Type: row[7] ?? row[7],
                Row_Status: row[8] ?? row[8],
                Row_Comment: row[9] ?? row[9],
                Row_Level: this.calculateRowLevel(row, 'All Tokens'),
            };
        }

        const dataTypeRowId = await this.getRowId('JSON', 'Row-ID');
        const mlTextRowId = await this.getRowId('JSON', 'ML-Text');
        const rowStatuses = await this.processStatus(
            allRegionsData[0],
            'Row_Status',
        );
        for (const regionEl of allRegionsData) {
            let nextRowPk = 0;
            const lastRowInserted =
                await this.rowService.getLastInsertedRecord();
            nextRowPk = +lastRowInserted.Row + 1;
            const createdRow = await this.rowService.createRow({
                Row: nextRowPk,
                RowLevel: regionEl.Row_Level,
            });

            // Row Format
            await this.formatService.createFormat({
                User: SYSTEM_INITIAL.USER_ID,
                ObjectType: dataTypeRowId,
                Object: createdRow.Row,
                Owner: SYSTEM_INITIAL.USER_ID,
                Status: regionEl.Row_Status ? rowStatuses : null,
                Comment: regionEl.Row_Comment
                    ? { [SYSTEM_INITIAL.ENGLISH]: regionEl.Row_Comment }
                    : null,
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
            if (
                COLUMN_NAMES.Row_Type in regionEl &&
                regionEl.Row_Type != null
            ) {
                const rowTypeRowId = await this.getRowId(
                    'JSON',
                    regionEl.Row_Type,
                );
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
                Supplier: row.slice(0, 7).find((value) => value != null),
                Row_Type: row[8] ?? row[8],
                Row_Status: row[9] ?? row[9],
                Row_Comment: row[10] ?? row[10],
                Row_Level: this.calculateRowLevel(row),
            };
        }

        const dataTypeRowId = await this.getRowId('JSON', 'Row-ID');
        const mlTextRowId = await this.getRowId('JSON', 'ML-Text');
        const rowStatuses = await this.processStatus(
            allSuppliersData[0],
            'Row_Status',
        );

        for (const supplierEl of allSuppliersData) {
            let nextRowPk = 0;
            const lastRowInserted =
                await this.rowService.getLastInsertedRecord();
            nextRowPk = +lastRowInserted.Row + 1;
            const createdRow = await this.rowService.createRow({
                Row: nextRowPk,
                RowLevel: supplierEl.Row_Level,
            });

            // Row Format
            await this.formatService.createFormat({
                User: SYSTEM_INITIAL.USER_ID,
                ObjectType: dataTypeRowId,
                Object: createdRow.Row,
                Owner: SYSTEM_INITIAL.USER_ID,
                Status: supplierEl.Row_Status ? rowStatuses : null,
                Comment: supplierEl.Row_Comment
                    ? { [SYSTEM_INITIAL.ENGLISH]: supplierEl.Row_Comment }
                    : null,
            });

            if (
                COLUMN_NAMES.Supplier in supplierEl &&
                supplierEl.Supplier != null
            ) {
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
            if (
                COLUMN_NAMES.Row_Type in supplierEl &&
                supplierEl.Row_Type != null
            ) {
                const rowTypeRowIds = await this.processStatus(
                    supplierEl,
                    'Row_Type',
                );
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

        await this.populateSiblingRowColumn();
        await this.populateParentRowColumn();
    }

    private async insertAllModelsSheetData(filePath: string) {
        const modelsWorkbook = XLSX.readFile(filePath);
        const allModelsWorkbook = modelsWorkbook.Sheets['All Models'];
        const allModelsSheetData = this.readSheetData(allModelsWorkbook);

        const filteredAllModelsData = allModelsSheetData.filter(
            (row) => !this.isAllNull(row),
        );

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
        const rowStatuses = await this.processStatus(
            allModelsData[0],
            'Row_Status',
        );

        for (const modelEl of allModelsData) {
            let nextRowPk = 0;
            const lastRowInserted =
                await this.rowService.getLastInsertedRecord();
            nextRowPk = +lastRowInserted.Row + 1;
            const createdRow = await this.rowService.createRow({
                Row: nextRowPk,
                RowLevel: modelEl.Row_Level,
            });

            // Row Format
            await this.formatService.createFormat({
                User: SYSTEM_INITIAL.USER_ID,
                ObjectType: dataTypeRowId,
                Object: createdRow.Row,
                Owner: SYSTEM_INITIAL.USER_ID,
                Status: modelEl.Row_Status ? rowStatuses : null,
                Comment: modelEl.Row_Comment
                    ? { [SYSTEM_INITIAL.ENGLISH]: modelEl.Row_Comment }
                    : null,
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
            if (
                COLUMN_NAMES.Release_Date in modelEl &&
                modelEl.Release_Date != null
            ) {
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
                const rowTypeRowIds = await this.processStatus(
                    modelEl,
                    'Row_Type',
                );
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

    private async insertAllUnitsSheetData(filePath: string) {
        const unitWorkbook = XLSX.readFile(filePath);
        const allUnitsWorkbook = unitWorkbook.Sheets['All Units'];
        const allUnitsSheetData = this.readSheetData(allUnitsWorkbook);

        const allUnitsData = [];
        for (const [rowIndex, row] of allUnitsSheetData.entries()) {
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
            const lastRowInserted =
                await this.rowService.getLastInsertedRecord();
            nextRowPk = +lastRowInserted.Row + 1;
            const rowId = await this.getRowId('JSON', 'Row-ID');
            const stdUnitRowId = await this.getRowId('JSON', 'Std-Unit');
            const mlTextRowId = await this.getRowId('JSON', 'ML-Text');
            const numberRowId = await this.getRowId('JSON', 'Number')
            const dropDownRowId = await this.getRowId('JSON', 'Drop-Down');
            const rowStatuses = await this.processStringToRowIds(
                unitEl.Row_Status,
            );

            // Creating Row
            const createdRow = await this.rowService.createRow({
                Row: nextRowPk,
                RowLevel: unitEl.Row_Level,
            });
            // Row Format
            await this.formatService.createFormat({
                User: SYSTEM_INITIAL.USER_ID,
                ObjectType: rowId,
                Object: createdRow.Row,
                Owner: SYSTEM_INITIAL.USER_ID,
                Status: unitEl.Row_Status ? rowStatuses : null,
                Comment: unitEl.Row_Comment
                    ? { 3000000100: unitEl.Row_Comment }
                    : null,
            });

            if (COLUMN_NAMES.Unit in unitEl && unitEl.Unit) {
                const createdItem = await this.itemService.createItem({
                    DataType: mlTextRowId,
                    JSON: { 3000000100: unitEl.Unit },
                });
                await this.cellService.createCell({
                    Col: 2000000084, // column id of "Unit"
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
                    Col: 2000000085, // column id of "Unit Factor"
                    Row: createdRow.Row,
                    Items: [createdItem.Item],
                });
            }

            if (COLUMN_NAMES.Row_Type in unitEl && unitEl.ROW_TYPE) {
                const createdItem = await this.itemService.createItem({
                    DataType: dropDownRowId,
                    Object: stdUnitRowId,
                });
                await this.cellService.createCell({
                    Col: 2000000004, // column id of "Row Type"
                    Row: createdRow.Row,
                    Items: [createdItem.Item],
                });
            }
        }
    }

    private async insertAllLabelsSheetData(filePath: string) {
        const suppliersWorkbook = XLSX.readFile(filePath);
        const allLabelsWorkbook = suppliersWorkbook.Sheets['All Labels'];
        const allLabelsSheetData = this.readSheetData(allLabelsWorkbook);

        const filteredAllLabelsData = allLabelsSheetData.filter(
            (row) => !this.isAllNull(row),
        );

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
            console.log(labelEl);
            let nextRowPk = 0;
            const lastRowInserted =
                await this.rowService.getLastInsertedRecord();
            nextRowPk = lastRowInserted ? +lastRowInserted.Row + 1 : 3000000201;
            const createdRow = await this.rowService.createRow({
                Row: nextRowPk,
                RowLevel: labelEl.Row_Level,
            });
            const createdFormat = await this.formatService.createFormat({
                User: SYSTEM_INITIAL.USER_ID,
                ObjectType: createdRow.Row,
                Object: createdRow.Row,
                Owner: SYSTEM_INITIAL.USER_ID,
            });

            for (const [key, val] of Object.entries(labelEl)) {
                if (key == 'Label' && val !== null) {
                    const createdItem = await this.itemService.createItem({
                        DataType: createdRow.Row,
                        JSON: { 3000000100: val },
                    });
                    await this.cellService.createCell({
                        Col: 2000000078, // column id of "Label"
                        Row: createdRow.Row,
                        Items: [createdItem.Item],
                    });

                } else if (key == 'Value-Data-Type' && val !== null) {
                    const createdItem = await this.itemService.createItem({
                        DataType: COL_DATA_TYPES.Drop_Down, // changed in all tokens, we should find it dynamically
                        Object: COL_DATA_TYPES.Category_ID, // changed in all tokens, we should find it dynamically
                    });
                    await this.cellService.createCell({
                        Col: 2000000079, // column id of "Value Data-Type"
                        Row: createdRow.Row,
                        Items: [createdItem.Item],
                    });

                } else if (key == 'Value_DropDown_Source' && val) {
                    const rowsIds = await this.processStringToRowIds(
                        val as string,
                    );
                    const createdItemIds = []
                    for (const rowId of rowsIds) {
                        const createdItem = await this.itemService.createItem({
                            DataType: COL_DATA_TYPES.DropDown_Source, // changed in all tokens, we should find it dynamically
                            JSON: { 3000000375: rowId },
                        });
                        createdItemIds.push(createdItem.Item);
                    }
                    await this.cellService.createCell({
                        Col: 2000000080, // column id of "Value DropDown-Source"
                        Row: createdRow.Row,
                        Items: createdItemIds,
                    });

                } else if (key == 'Value_Default_Data' && val) {
                    const createdItem = await this.itemService.createItem({
                        DataType: COL_DATA_TYPES.Value_Data_Type, // changed in all tokens, we should find it dynamically
                        JSON: { 3000000100: val },
                    });
                    const createdCell = await this.cellService.createCell({
                        Col: 2000000081, // column id of "Value Default-Data"
                        Row: 3000000201, // as per setup sheet - Row.Row = 0
                        Items: [createdItem.Item],
                    });
                    await this.formatService.updateFormat(
                        createdFormat.Format,
                        {
                            Default: createdCell, // putting cell id
                        },
                    );
                } else if (key == 'Value_Status' && val) {
                    const valueStatusRows = await this.processStringToRowIds(
                        val as string,
                    );
                    const createdItemIds = [];
                    for (const rowId of valueStatusRows) {
                        const createdItem = await this.itemService.createItem({
                            DataType: COL_DATA_TYPES.Drop_Down, // changed in all tokens, we should find it dynamically
                            Object: rowId,
                        });
                        createdItemIds.push(createdItem.Item);
                    }
                    await this.cellService.createCell({
                        Col: 2000000081, // column id of "Value Default-Data"
                        Row: createdRow.Row,
                        Items: createdItemIds,
                    });
                } else if (key == 'Value_Formula' && val) {
                    const createdItem = await this.itemService.createItem({
                        DataType: COL_DATA_TYPES.Formula, // changed in all tokens, we should find it dynamically
                        JSON: { 3000000382: val },
                    });
                    await this.cellService.createCell({
                        Col: 2000000083, // column id of "Value Formula"
                        Row: createdRow.Row,
                        Items: [createdItem.Item],
                    });
                } else if (key == 'Row_Type' && val) {
                    const rowTypes = await this.processStringToRowIds(
                        val as string,
                    );
                    const createdItemIds = [];
                    for (const rowId of rowTypes) {
                        const createdItem = await this.itemService.createItem({
                            DataType: COL_DATA_TYPES.Drop_Down, // changed in all tokens, we should find it dynamically
                            Object: rowId,
                        });
                        createdItemIds.push(createdItem.Item);
                    }
                    await this.cellService.createCell({
                        Col: 2000000004, // column id of "Row Type"
                        Row: createdRow.Row,
                        Items: createdItemIds,
                    });
                } else if (key == 'Row_Status' && val) {
                    await this.formatService.updateFormat(
                        createdFormat.Format,
                        {
                            Status: [STATUSES.SECTION_HEAD], // changed in all tokens, we should find it dynamically
                        },
                    );
                } else if (key == 'Row_Comment' && val !== null) {
                    await this.formatService.updateFormat(
                        createdFormat.Format,
                        {
                            Comment: { 3000000100: val },
                        },
                    );
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
                const object =
                    tokenEl.Row_Type == 'Node'
                        ? nodeRowId.Row
                        : defaultRowId.Row;
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
        const item = await this.itemService.findOneByColumnName(
            colName,
            colValue,
        );
        if (item) {
            const cell = await this.cellService.findOneByColumnName(
                'Items',
                item.Item,
            );
            if (cell.Row?.Row) {
                const rowEntity = await this.rowService.findOne(cell.Row.Row);
                return rowEntity;
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
