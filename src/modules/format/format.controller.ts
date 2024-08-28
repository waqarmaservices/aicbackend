import { Controller, Get, Post, Put, Delete, Param, Body, HttpStatus } from '@nestjs/common';
import { FormatService } from './format.service';
import { ApiResponse } from '../../common/dtos/api-response.dto';
import { Format } from './format.entity';
import { Col } from 'modules/col/col.entity';

@Controller('formats')
export class FormatController {
  constructor(private readonly formatService: FormatService) {}
  @Post()
  async createFormat(@Body() payload: any): Promise<ApiResponse<any>> {
    try {
      const format = await this.formatService.createFormat(payload);

      // Construct the response data with the desired nested structure
      const data = {
        Format_Create: {
          Format: format.Format,
          Object: format.Object,
          ObjectType: format.ObjectType, // Nested ObjectType
          Container: format.Container,
          PgSort: format.PgSort,
          PgFilter: format.PgFilter,
          PgCols: format.PgCols,
          CellItems: format.CellItems,
          ColMinWidth: format.ColMinWidth,
          Status: format.Status,
          FontStyle: format.FontStyle,
          Formula: format.Formula,
          Comment: format.Comment,
          DeletedAt: format.DeletedAt,
          User: format.User, // Nested User
          PgNestedCol: format.PgNestedCol, // Nested PgNestedCol
          PgLevelSet: format.PgLevelSet, // Nested PgLevelSet
          PgSearchSet: format.PgSearchSet, // Nested PgSearchSet
          RowSetTick: format.RowSetTick, // Nested RowSetTick
          Owner: format.Owner, // Nested Owner
          Default: format.Default, // Nested Default
          Deleted: format.Deleted, // Nested Deleted
          DeletedBy: format.DeletedBy, // Nested DeletedBy
        },
      };

      return new ApiResponse(true, data, '', HttpStatus.CREATED);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll(): Promise<ApiResponse<Format[]>> {
    try {
      const formats = await this.formatService.findAll();
      return new ApiResponse(true, formats, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ApiResponse<any>> {
    try {
      const format = await this.formatService.findOne(id);
      if (!format) {
        return new ApiResponse(false, null, 'Format not found', HttpStatus.NOT_FOUND);
      }
      // Construct the response data with the desired nested structure
      const data = {
        Format_Data: {
          Format: format.Format,
          Object: format.Object,
          ObjectType: format.ObjectType, // Nested ObjectType
          Container: format.Container,
          PgSort: format.PgSort,
          PgFilter: format.PgFilter,
          PgCols: format.PgCols,
          CellItems: format.CellItems,
          ColMinWidth: format.ColMinWidth,
          Status: format.Status,
          FontStyle: format.FontStyle,
          Formula: format.Formula,
          Comment: format.Comment,
          DeletedAt: format.DeletedAt,
          User: format.User, // Nested User
          PgNestedCol: format.PgNestedCol, // Nested PgNestedCol
          PgLevelSet: format.PgLevelSet, // Nested PgLevelSet
          PgSearchSet: format.PgSearchSet, // Nested PgSearchSet
          RowSetTick: format.RowSetTick, // Nested RowSetTick
          Owner: format.Owner, // Nested Owner
          Default: format.Default, // Nested Default
          Deleted: format.Deleted, // Nested Deleted
          DeletedBy: format.DeletedBy, // Nested DeletedBy
        },
      };
      return new ApiResponse(true, data, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Put(':id')
  async updateFormat(@Param('id') id: number, @Body() updateData: Partial<any>): Promise<ApiResponse<any>> {
    try {
      const updatedFormat = await this.formatService.updateFormat(id, updateData);
      if (!updatedFormat) {
        return new ApiResponse(false, null, 'Format not found', HttpStatus.NOT_FOUND);
      }
      // Construct the response data with the desired nested structure
      const data = {
        Updated_Format: {
          Format: updateData.Format,
          Object: updateData.Object,
          ObjectType: updateData.ObjectType, // Nested ObjectType
          Container: updateData.Container,
          PgSort: updateData.PgSort,
          PgFilter: updateData.PgFilter,
          PgCols: updateData.PgCols,
          CellItems: updateData.CellItems,
          ColMinWidth: updateData.ColMinWidth,
          Status: updateData.Status,
          FontStyle: updateData.FontStyle,
          Formula: updateData.Formula,
          Comment: updateData.Comment,
          DeletedAt: updateData.DeletedAt,
          User: updateData.User, // Nested User
          PgNestedCol: updateData.PgNestedCol, // Nested PgNestedCol
          PgLevelSet: updateData.PgLevelSet, // Nested PgLevelSet
          PgSearchSet: updateData.PgSearchSet, // Nested PgSearchSet
          RowSetTick: updateData.RowSetTick, // Nested RowSetTick
          Owner: updateData.Owner, // Nested Owner
          Default: updateData.Default, // Nested Default
          Deleted: updateData.Deleted, // Nested Deleted
          DeletedBy: updateData.DeletedBy, // Nested DeletedBy
        },
      };
      return new ApiResponse(true, data, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Delete(':id')
  async deleteFormat(@Param('id') id: number): Promise<ApiResponse<any>> {
    try {
      const deletedFormat = await this.formatService.deleteFormat(id);
      if (!deletedFormat) {
        return new ApiResponse(false, null, 'Format not found', HttpStatus.NOT_FOUND);
      }

      // Construct the response data with the desired nested structure
      const data = {
        Deleted_Format: {
          Format: deletedFormat.Format,
        },
      };

      return new ApiResponse(true, data, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Put('delete-row/:rowId')
  async deleteRowAndUpdateFormat(
    @Param('rowId') rowId: number,
    @Body('userId') userId: number,
  ): Promise<ApiResponse<any>> {
    // Use `any` for the response type to match your custom structure
    try {
      const updatedFormat = await this.formatService.updateFormatOnRowDelete(rowId, userId);
      // Build the response data with only available attributes
      const responseData: any = {
        Delete_Row: {
          Format: updatedFormat.Format?.toString(),
          Object: updatedFormat.Object?.toString(),
          Deleted: updatedFormat.Deleted?.toString(),
          DeletedBy: updatedFormat.DeletedBy?.toString(),
          DeletedAt: updatedFormat.DeletedAt?.toISOString(),
        },
      };
      return new ApiResponse(true, responseData, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Put('delete-Pg/:Pg')
  async updateFormatOnpageDelete(@Param('Pg') Pg: number, @Body('userId') userId: number): Promise<ApiResponse<any>> {
    // Use `any` for the response type to match your custom structure
    try {
      const updatedFormat = await this.formatService.updateFormatOnpageDelete(Pg, userId);

      // Build the response data with only available attributes
      const responseData: any = {
        Delete_Page: {
          Format: updatedFormat.Format?.toString(),
          Object: updatedFormat.Object?.toString(),
          Deleted: updatedFormat.Deleted?.toString(),
          DeletedBy: updatedFormat.DeletedBy?.toString(),
          DeletedAt: updatedFormat.DeletedAt?.toISOString(),
        },
      };
      return new ApiResponse(true, responseData, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Put('delete-Col/:Col')
  async updateFormatOnColumnsDelete(
    @Param('Col') Col: number,
    @Body('userId') userId: number,
  ): Promise<ApiResponse<any>> {
    // Use `any` for the response type to match your custom structure
    try {
      const updatedFormat = await this.formatService.updateFormatOnColumnsDelete(Col, userId);

      // Build the response data with only available attributes
      const responseData: any = {
        Delete_Column: {
          Format: updatedFormat.Format?.toString(),
          Object: updatedFormat.Object?.toString(),
          Deleted: updatedFormat.Deleted?.toString(),
          DeletedBy: updatedFormat.DeletedBy?.toString(),
          DeletedAt: updatedFormat.DeletedAt?.toISOString(),
        },
      };
      return new ApiResponse(true, responseData, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Put('check-update-format/:itemId')
  async checkAndUpdateFormat(
    @Body('itemId') itemId: number,
    @Body('userId') userId: number,
  ): Promise<ApiResponse<any>> {
    try {
      const updatedFormat = await this.formatService.checkAndUpdateFormat(itemId, userId);

      const responseData: any = {
        Format: {
          Format: updatedFormat.Format,
          Object: updatedFormat.Object?.toString(),
          ObjectType: updatedFormat.ObjectType?.toString(),
          User: updatedFormat.User?.toString(),
          Deleted: updatedFormat.Deleted?.toString(),
          DeletedBy: updatedFormat.DeletedBy?.toString(),
          DeletedAt: updatedFormat.DeletedAt?.toISOString(),
        },
      };
      return new ApiResponse(true, responseData, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Put('edit-column/:colid')
  async editColumnFormat(@Param('colid') colid: number, @Body() updateData: Partial<any>): Promise<ApiResponse<any>> {
    try {
      const updatedFormat = await this.formatService.editColumnFormat(colid, updateData);

      if (!updatedFormat) {
        return new ApiResponse(false, null, 'Format not found', HttpStatus.NOT_FOUND);
      }

      // Construct the response data with the desired nested structure
      const data = {
        Updated_Format: {
          Format: updateData.Format,
          Object: updateData.Object,
          ObjectType: updateData.ObjectType, // Nested ObjectType
          Container: updateData.Container,
          PgSort: updateData.PgSort,
          PgFilter: updateData.PgFilter,
          PgCols: updateData.PgCols,
          CellItems: updateData.CellItems,
          ColMinWidth: updateData.ColMinWidth,
          Status: updateData.Status,
          FontStyle: updateData.FontStyle,
          Formula: updateData.Formula,
          Comment: updateData.Comment,
          DeletedAt: updateData.DeletedAt,
          User: updateData.User, // Nested User
          PgNestedCol: updateData.PgNestedCol, // Nested PgNestedCol
          PgLevelSet: updateData.PgLevelSet, // Nested PgLevelSet
          PgSearchSet: updateData.PgSearchSet, // Nested PgSearchSet
          RowSetTick: updateData.RowSetTick, // Nested RowSetTick
          Owner: updateData.Owner, // Nested Owner
          Default: updateData.Default, // Nested Default
          Deleted: updateData.Deleted, // Nested Deleted
          DeletedBy: updateData.DeletedBy, // Nested DeletedBy
        },
      };

      return new ApiResponse(true, data, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Put('update-PgFormat/:Pg')
  async updatePageFormat(
    @Param('Pg') Pg: number,
    @Body('userId') userId: number,
    @Body() updateFormat: Partial<any>,
  ): Promise<ApiResponse<any>> {
    try {
      const updatedFormat = await this.formatService.updatePageFormat(Pg, userId, updateFormat);

      // Build the response data with updated attributes
      const responseData: any = {
        Updated_Page_Format: {
          Format: updatedFormat.Format,
          Object: updatedFormat.Object,
          User: updatedFormat.User,
          PgNestedCol: updatedFormat.PgNestedCol,
          PgFreezeCol: updatedFormat.PgFreezeCol,
          PgExpand: updatedFormat.PgExpand,
          PgSort: updatedFormat.PgSort,
          PgFilter: updatedFormat.PgFilter,
          PgLevelSet: updatedFormat.PgLevelSet,
          PgSearchSet: updatedFormat.PgSearchSet,
          FontStyle: updatedFormat.FontStyle,
          Comment: updatedFormat.Comment,
          TxList: updatedFormat.TxList,
        },
      };
      return new ApiResponse(true, responseData, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
    @Put('local-col/:colid')
    async updatelocalcolls(@Param('colid') colid: number, @Body('userId') userId: number, @Body() updateData: Partial<any>): Promise<ApiResponse<any>> {
        try {
            const updatedFormat = await this.formatService.updatelocalcolls(colid, userId, updateData);
            if (!updatedFormat) {
                return new ApiResponse(false, null, 'Format not found', HttpStatus.NOT_FOUND);
            }
            // Construct the response data with the desired nested structure
            const data = {
                updated_local_col: {
                    Format: updateData.Format || updatedFormat.Format,
                    User: updateData.User || updatedFormat.User,
                    Column_ID: updateData.Object || updatedFormat.Object,
                    Status: updateData.Status || updatedFormat.Status,
                    MinWidth: updateData.ColMinWidth || updatedFormat.ColMinWidth,
                    FontStyle: updateData.FontStyle || updatedFormat.FontStyle,
                    Comment: updateData.Comment || updatedFormat.Comment,
                    Transactions: updateData.TxList || updatedFormat.TxList,
                },
            };

            return new ApiResponse(true, data, '', HttpStatus.OK);
        } catch (error) {
            return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @Put('shared-col/:colid')
    async updatesharedcolls(@Param('colid') colid: number, @Body('userId') userId: number, @Body() updateData: Partial<any>): Promise<ApiResponse<any>> {
        try {
            const updatedFormat = await this.formatService.updatesharedcolls(colid, userId, updateData);

            if (!updatedFormat) {
                return new ApiResponse(false, null, 'Format not found', HttpStatus.NOT_FOUND);
            }

            // Construct the response data with the desired nested structure
            const data = {
                updated_shared_col: {
                    Format: updateData.Format || updatedFormat.Format,
                    User: updateData.User || updatedFormat.User,
                    Column_ID: updateData.Object || updatedFormat.Object,
                    Status: updateData.Status || updatedFormat.Status,
                    MinWidth: updateData.ColMinWidth || updatedFormat.ColMinWidth,
                    FontStyle: updateData.FontStyle || updatedFormat.FontStyle,
                    Comment: updateData.Comment || updatedFormat.Comment,
                    Transactions: updateData.TxList || updatedFormat.TxList,
                },
            };

            return new ApiResponse(true, data, '', HttpStatus.OK);
        } catch (error) {
            return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @Put('local-item/:itemId')
    async updatelocalitem(@Param('itemId') itemId: number, @Body('userId') userId: number, @Body() updateData: Partial<any>): Promise<ApiResponse<any>> {
        try {
            const updatedFormat = await this.formatService.updatelocalitem(itemId, userId, updateData);

            if (!updatedFormat) {
                return new ApiResponse(false, null, 'Format not found', HttpStatus.NOT_FOUND);
            }

            // Construct the response data with the desired nested structure
            const data = {
                updated_local_item: {
                    Format: updateData.Format || updatedFormat.Format,
                    User: updateData.User || updatedFormat.User,
                    Column_ID: updateData.Object || updatedFormat.Object,
                    Status: updateData.Status || updatedFormat.Status,
                    MinWidth: updateData.ColMinWidth || updatedFormat.ColMinWidth,
                    FontStyle: updateData.FontStyle || updatedFormat.FontStyle,
                    Comment: updateData.Comment || updatedFormat.Comment,
                    Transactions: updateData.TxList || updatedFormat.TxList,
                },
            };

            return new ApiResponse(true, data, '', HttpStatus.OK);
        } catch (error) {
            return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @Put('shared-item/:itemId')
    async updateshareditem(@Param('itemId') itemId: number, @Body('userId') userId: number, @Body() updateData: Partial<any>): Promise<ApiResponse<any>> {
        try {
            const updatedFormat = await this.formatService.updateshareditem(itemId, userId, updateData);

            if (!updatedFormat) {
                return new ApiResponse(false, null, 'Format not found', HttpStatus.NOT_FOUND);
            }

            // Construct the response data with the desired nested structure
            const data = {
                updated_shared_item: {
                    Format: updateData.Format || updatedFormat.Format,
                    User: updateData.User || updatedFormat.User,
                    Column_ID: updateData.Object || updatedFormat.Object,
                    Status: updateData.Status || updatedFormat.Status,
                    MinWidth: updateData.ColMinWidth || updatedFormat.ColMinWidth,
                    FontStyle: updateData.FontStyle || updatedFormat.FontStyle,
                    Comment: updateData.Comment || updatedFormat.Comment,
                    Transactions: updateData.TxList || updatedFormat.TxList,
                },
            };

            return new ApiResponse(true, data, '', HttpStatus.OK);
        } catch (error) {
            return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @Put('local-row/:rowid')
    async updatelocalrow(@Param('rowId') rowId: number, @Body('userId') userId: number, @Body() updateData: Partial<any>): Promise<ApiResponse<any>> {
        try {
            const updatedFormat = await this.formatService.updatelocalrow(rowId, userId, updateData);

            if (!updatedFormat) {
                return new ApiResponse(false, null, 'Format not found', HttpStatus.NOT_FOUND);
            }

            // Construct the response data with the desired nested structure
            const data = {
                updated_local_item: {
                    Format: updateData.Format || updatedFormat.Format,
                    User: updateData.User || updatedFormat.User,
                    local_row_ID: updateData.Object || updatedFormat.Object,
                    row_Status: updateData.Status || updatedFormat.Status,
                    row_type: updateData.ColMinWidth || updatedFormat.ColMinWidth,
                    row_FontStyle: updateData.FontStyle || updatedFormat.FontStyle,
                    row_Comment: updateData.Comment || updatedFormat.Comment,
                    Row_Transactions: updateData.TxList || updatedFormat.TxList,
                },
            };

            return new ApiResponse(true, data, '', HttpStatus.OK);
        } catch (error) {
            return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @Put('shared-row/:rowId')
    async updatesharedrow(@Param('rowId') rowId: number, @Body('userId') userId: number, @Body() updateData: Partial<any>): Promise<ApiResponse<any>> {
        try {
            const updatedFormat = await this.formatService.updatesharedrow(rowId, userId, updateData);

            if (!updatedFormat) {
                return new ApiResponse(false, null, 'Format not found', HttpStatus.NOT_FOUND);
            }

            // Construct the response data with the desired nested structure
            const data = {
                updated_shared_item: {
                    Format: updateData.Format || updatedFormat.Format,
                    User: updateData.User || updatedFormat.User,
                    shared_row_ID: updateData.Object || updatedFormat.Object,
                    row_Status: updateData.Status || updatedFormat.Status,
                    row_type: updateData.ColMinWidth || updatedFormat.ColMinWidth,
                    row_FontStyle: updateData.FontStyle || updatedFormat.FontStyle,
                    row_Comment: updateData.Comment || updatedFormat.Comment,
                    Row_Transactions: updateData.TxList || updatedFormat.TxList,
                },
            };

            return new ApiResponse(true, data, '', HttpStatus.OK);
        } catch (error) {
            return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
