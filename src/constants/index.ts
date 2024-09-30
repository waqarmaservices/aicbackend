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
  ALL_PAGES: { sheetRows: 15, skipRows: 7, skipColumnRows: 6 },
  ALL_COLS: { skipRows: 6, skipColumnRows: 5 },
  ALL_TOKENS: { skipRows: 3 },
  ALL_LANGUAGES: { skipRows: 3 },
  ALL_REGIONS: { skipRows: 3 },
  ALL_SUPPLIERS: { skipRows: 3 },
  ALL_MODELS: { skipRows: 3 },
  ALL_UNITS: { skipRows: 3 },
  ALL_LABELS: { skipRows: 6 },
};

export const SYSTEM_INITIAL = {
  ALL_PAGES: 1000000001,
  ALL_COLS: 1000000006,
  ALL_TOKENS: 1000000009,
  ENGLISH: 3000000100,
  ORIGINAL_URL: 3000000325,
  USER_ID: 3000000099,
  CURRENCIES: 3000000098,
  ALL_LANGUAGES: 1000000012,
  DEFAULT: 3000000268,
  PAGE: 3000000582,
  COLUMN: 3000000589,
  CELL: 3000000597,
  ROW: 3000000593,
  ITEM: 3000000601,
  EXCLUDE_DDS_HEAD: 3000000300,
  CALCULATE_DATA: 3000000309,
};

export const PAGE_IDS = {
  ALL_PAGES: 1000000001,
  ALL_PRODUCTS: 1000000002,
  ALL_LEVEL_SETS: 1000000003,
  ALL_SEARCH_SETS: 1000000004,
  ALL_CATEGORIES: 1000000005,
  ALL_COLS: 1000000006,
  ALL_PROFILES: 1000000007,
  ALL_USERS: 1000000008,
  ALL_TOKENS: 1000000009,
  ALL_LABELS: 1000000010,
  ALL_UNITS: 1000000011,
  ALL_LANGUAGES: 1000000012,
  ALL_REGIONS: 1000000013,
  ALL_SUPPLIERS: 1000000014,
  ALL_MODELS: 1000000015,
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
  ALL_PAGES: {
    PAGE_URL: 2000000041,
    PAGE_SEO: 2000000042,
  },
  ALL_COLS: {
    Col_ID: 2000000053,
    PAGE_TYPE: 2000000054,
    PAGE_ID: 2000000055,
    COL_NAME: 2000000056,
    COL_DATATYPE: 2000000057,
    COL_DROPDOWNSOURCE: 2000000058,
  },
  ALL_TOKENS: {
    TOKEN: 2000000069,
  },
  ALL_LANGUAGES: {
    LANGUAGE: 2000000078,
  },
  ALL_REGIONS: {
    REGION: 2000000079,
  },
  ALL_SUPPLIERS: {
    SUPPLIER: 2000000080,
  },
  ALL_MODELS: {
    MODEL: 2000000081,
    RELEASE_DATE: 2000000082,
  },
  ALL_UNITS: {
    UNIT: 2000000076,
    UNIT_FACTOR: 2000000077,
  },
  ALL_LABELS: {
    LABELS: 2000000070,
    VALUE_DATATYPE: 2000000071,
    VALUE_DROPDOWNSOURCE: 2000000072,
    VALUE_DEFAULTDATA: 2000000073,
    VALUE_STATUS: 2000000074,
    VALUE_FORMULA: 2000000075,
  },
  SHARED: {
    ROW_TYPE: 2000000004,
    ROW_STATUS: 2000000005,
    ROW_COMMENT: 2000000006,
    PAGE_ID: 2000000007,
    PAGE_NAME: 2000000008,
    PAGE_EDITION: 2000000010,
    PAGE_TYPE: 2000000009,
  },
};

export const SECTION_HEAD = 'Section';

export const TOKEN_NAMES = {
  UserID: 'UserID',
  RowID: 'RowID',
  SectionHead: 'Section',
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
  Page: 'Page',
  Column: 'Column',
  Row: 'Row',
  Cell: 'Cell',
  Item: 'Item',
  User: 'User',
};

export const TOKEN_IDS = {
  Row_Type: 3000000262,
  Statuses: 3000000202,
  Category_Label: 3000002002,
  Product_Label: 3000002005,
  Keys: 3000000327,
  Preference: 3000000335,
  LevelSet_Label: 3000002043,
  True___False: 3000001046,
  SearchSet_Label: 3000002035,
  Param_Opr: 3000000338,
  Page_Type: 3000000248,
  Edition: 3000000250,
  All_DataTypes: 3000001001,
  Display_Setting: 3000002084,
  Profile_Label: 3000001047,
  User_Type: 3000000292,
  All_Units: 3000001051,
  All_Tokens: 3000000201,
  PAGE_TYPE: {
    EACH_PAGE: 3000000251,
  },
  ALL_UNITS: {
    Number: 3000001008,
    Date: 3000001012
  }
};

export const GENERAL = {
  Row: 'Row',
  RowId: 'Row Id',
};

export const PAGE_CACHE = {
  NEVER_EXPIRE: 0,
};

export const ALL_DATATYPES = {
  DropDownSource: 3000001036,
};
