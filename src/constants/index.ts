export const SHEET_NAMES = {
  ALL_PAGES: 'All Pages',
  ALL_COLS: 'All Cols',
  ALL_TOKENS: 'All Tokens',
  ALL_LANGUAGES: 'All Languages',
  ALL_REGIONS: 'All Regions',
  ALL_SUPPLIERS: 'All Suppliers',
  ALL_MODELS: 'All Models',
  ALL_UNITS: 'All Units',
  ALL_LABELS: 'All Labels',
};

export const SHEET_READ_OPTIONS = {
  ALL_PAGES: { sheetRows: 15, skipRows: 3 },
  ALL_COLS: { skipRows: 3 },
  ALL_TOKENS: { skipRows: 3 },
  ALL_LANGUAGES: { skipRows: 3 },
  ALL_REGIONS: { skipRows: 3 },
  ALL_SUPPLIERS: { skipRows: 3 },
  ALL_MODELS: { skipRows: 3 },
  ALL_UNITS: { skipRows: 3 },
  ALL_LABELS: { skipRows: 5 },
};

export const SYSTEM_INITIAL = {
  ALL_PAGES: 1000000001,
  ALL_COLS: 1000000002,
  ALL_TOKENS: 1000000003,
  ENGLISH: 3000000100,
  USER_ID: 3000000099,
  ALL_LANGUAGES: 1000000003,
  DEFAULT: 3000000346,
};

export const COLUMN_NAMES = {
  Page_ID: 'Page_ID',
  Col_ID: 'Col_ID',
  Page_Name: 'Page_Name',
  Page_Type: 'Page_Type',
  Page_Edition: 'Page_Edition',
  Page_URL: 'Page_URL',
  Page_SEO: 'Page_SEO',
  Col_Name: 'Col_Name',
  Col_DataType: 'Col_DataType',
  Col_DropDownSource: 'Col_DropDownSource',
  Language: 'Language',
  Region: 'Region',
  TOKEN: 'TOKEN',
  Row_Type: 'Row_Type',
  Supplier: 'Supplier',
  Model: 'Model',
  Release_Date: 'Release_Date',
  Unit: 'Unit',
  Unit_Factor: 'Unit_Factor',
  Label: 'Label',
  Value_DataType: 'Value_DataType',
  Value_DropDownSource: 'Value_DropDownSource',
  Value_DefaultData: 'Value_DefaultData',
  Value_Status: 'Value_Status',
  Value_Formula: 'Value_Formula',
  Row_Status: 'Row_Status',
  Row_Comment: 'Row_Comment',
  Row_Level: 'Row_Level',
};

export const COLUMN_IDS = {
  COL_NAME: 2000000049,
  COL_ID: 2000000046,
  PAGE_TYPE: 2000000039,
};

export const SECTION_HEAD = 'Section-Head';

export const TOKEN_NAMES = {
  UserID: 'UserID',
  RowID: 'RowID',
  SectionHead: 'Section-Head',
  MLText: 'MLText',
  Default: 'Default',
  Date: 'Date',
  Number: 'Number',
  DropDown: 'DropDown',
  DropDownSource: 'DropDownSource',
  DDSType: 'DDS-Type',
  ValueDataType: 'Value DataType',
  Formula: 'Formula',
  Node: 'Node',
  PageID: 'PageID',
  System: 'System',
  URL: 'URL',
  PgRow: 'Pg-Row',
  ColID: 'ColID',
  ColRow: 'Col-Row',
  PageType: {
    PageList: 'Page List',
  },
};

export const TOKEN_IDS = {
  PAGE_TYPE: {
    EACH_PAGE: 3000000329,
  },
};
