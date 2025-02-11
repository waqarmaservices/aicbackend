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
          RecycledAt: format.RecycledAt,
          User: format.User, // Nested User
          PgNestedCol: format.PgNestedCol, // Nested PgNestedCol
          PgLevelSet: format.PgLevelSet, // Nested PgLevelSet
          PgSearchSet: format.PgSearchSet, // Nested PgSearchSet
          RowSetTick: format.RowSetTick, // Nested RowSetTick
          Owner: format.Owner, // Nested Owner
          Default: format.Default, // Nested Default
          Recycled: format.Recycled, 
          RecycledBy: format.RecycledBy, 
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
            RecycledAt: format.RecycledAt,
            User: format.User, // Nested User
            PgNestedCol: format.PgNestedCol, // Nested PgNestedCol
            PgLevelSet: format.PgLevelSet, // Nested PgLevelSet
            PgSearchSet: format.PgSearchSet, // Nested PgSearchSet
            RowSetTick: format.RowSetTick, // Nested RowSetTick
            Owner: format.Owner, // Nested Owner
            Default: format.Default, // Nested Default
            Recycled: format.Recycled, 
            RecycledBy: format.RecycledBy, 
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
          RecycledAt: updateData.RecycledAt,
          User: updateData.User, // Nested User
          PgNestedCol: updateData.PgNestedCol, // Nested PgNestedCol
          PgLevelSet: updateData.PgLevelSet, // Nested PgLevelSet
          PgSearchSet: updateData.PgSearchSet, // Nested PgSearchSet
          RowSetTick: updateData.RowSetTick, // Nested RowSetTick
          Owner: updateData.Owner, // Nested Owner
          Default: updateData.Default, // Nested Default
          Recycled: updateData.Recycled, 
          RecycledBy: updateData.RecycledBy, 
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
  @Put('delete-row/:Pg/:rowId')
  async deleteRowAndUpdateFormat(
    @Param('rowId') rowId: number,
    @Body('userId') userId: number,
    @Param('Pg') Pg: number,
  ): Promise<ApiResponse<any>> {
    // Use `any` for the response type to match your custom structure
    try {
      const updatedFormat = await this.formatService.updateFormatOnRowDelete(Pg, rowId, userId);
      // Build the response data with only available attributes
      const responseData: any = {
        Delete_Row: {
          Format: updatedFormat.Format?.toString(),
          Object: updatedFormat.Object?.toString(),
          Recycled: updatedFormat.Recycled?.toString(),
          RecycledBy: updatedFormat.RecycledBy?.toString(),
          RecycledAt: updatedFormat.RecycledAt?.toISOString(),
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
          Recycled: updatedFormat.Recycled?.toString(),
          RecycledBy: updatedFormat.RecycledBy?.toString(),
          RecycledAt: updatedFormat.RecycledAt?.toISOString(),
        },
      };
      return new ApiResponse(true, responseData, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Put('delete-Col/:Pg/:Col')
  async updateFormatOnColumnsDelete(
    @Param('Col') Col: number,
    @Body('userId') userId: number,
    @Param('Pg') Pg: number,
  ): Promise<ApiResponse<any>> {
    // Use `any` for the response type to match your custom structure
    try {
      const updatedFormat = await this.formatService.updateFormatOnColumnsDelete(Pg,Col, userId);

      // Build the response data with only available attributes
      const responseData: any = {
        Delete_Column: {
          Format: updatedFormat.Format?.toString(),
          Object: updatedFormat.Object?.toString(),
          Recycled: updatedFormat.Recycled?.toString(),
          RecycledBy: updatedFormat.RecycledBy?.toString(),
          RecycledAt: updatedFormat.RecycledAt?.toISOString(),
        },
      };
      return new ApiResponse(true, responseData, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Post('delete-item/:Pg/')
  async deleteitem(
    @Body('colId') colId: number,
    @Body('rowId') rowId: number,
    @Body('userId') userId: number,
    @Param('Pg') Pg: number, 
  ): Promise<ApiResponse<any>> {
    try {
      const updatedFormat = await this.formatService.deleteitem(Pg, colId, rowId, userId);

      const responseData: any = {
        'Deleted Item': {
          Format: updatedFormat.Format,
          Object: updatedFormat.Object,
          ObjectType: updatedFormat.ObjectType,
          User: updatedFormat.User,
          Recycled: updatedFormat.Recycled,
          RecycledBy: updatedFormat.RecycledBy,
          RecycledAt: updatedFormat.RecycledAt,
        },
      };
      return new ApiResponse(true, responseData, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Put('edit-column/:Pg/:colid')
  async editColumnFormat(@Param('colid') colid: number,
  @Body('userId') userId: number, 
  @Param('Pg') Pg: number,
  @Body() updateData: Partial<any>
): Promise<ApiResponse<any>> {
    try {
      const updatedFormat = await this.formatService.editColumnFormat(Pg, colid, userId, updateData);

      if (!updatedFormat) {
        return new ApiResponse(false, null, 'Format not found', HttpStatus.NOT_FOUND);
      }

      // Construct the response data with the desired nested structure
      const data = {
        "Edit Column": {
            Format: updateData.Format || updatedFormat.Format,
            Object: updateData.Object || updatedFormat.Object,
            ObjectType: updateData.ObjectType || updatedFormat.ObjectType, // Nested ObjectType
            Container: updateData.Container || updatedFormat.Container,
            PgSort: updateData.PgSort || updatedFormat.PgSort,
            PgFilter: updateData.PgFilter || updatedFormat.PgFilter,
            PgCols: updateData.PgCols || updatedFormat.PgCols,
            CellItems: updateData.CellItems || updatedFormat.CellItems,
            ColMinWidth: updateData.ColMinWidth || updatedFormat.ColMinWidth,
            Status: updateData.Status || updatedFormat.Status,
            FontStyle: updateData.FontStyle || updatedFormat.FontStyle,
            Formula: updateData.Formula || updatedFormat.Formula,
            Comment: updateData.Comment || updatedFormat.Comment,
            RecycledAt: updateData.RecycledAt || updatedFormat.RecycledAt,
            User: updateData.User || updatedFormat.User, // Nested User
            PgNestedCol: updateData.PgNestedCol || updatedFormat.PgNestedCol, // Nested PgNestedCol
            PgLevelSet: updateData.PgLevelSet || updatedFormat.PgLevelSet, // Nested PgLevelSet
            PgSearchSet: updateData.PgSearchSet || updatedFormat.PgSearchSet, // Nested PgSearchSet
            RowSetTick: updateData.RowSetTick || updatedFormat.RowSetTick, // Nested RowSetTick
            Owner: updateData.Owner || updatedFormat.Owner, // Nested Owner
            Default: updateData.Default || updatedFormat.Default, // Nested Default
            Recycled: updateData.Recycled || updatedFormat.Recycled, 
            RecycledBy: updateData.RecycledBy || updatedFormat.RecycledBy, 
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
        "Update Page": {
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
  @Put('local-col/:Pg/:colid')
  async updatelocalcolls(
    @Param('colid') colid: number,
    @Body('userId') userId: number,
    @Param('Pg') Pg: number,
    @Body() updateData: Partial<any>,
  ): Promise<ApiResponse<any>> {
    try {
      const updatedFormat = await this.formatService.updatelocalcolls(Pg, colid, userId, updateData);
      if (!updatedFormat) {
        return new ApiResponse(false, null, 'Format not found', HttpStatus.NOT_FOUND);
      }
      // Construct the response data with the desired nested structure
      const data = {
        "Local Col": {
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
  @Put('shared-col/:Pg/:colid')
  async updatesharedcolls(
    @Param('colid') colid: number,
    @Body('userId') userId: number,
    @Param('Pg') Pg: number,
    @Body() updateData: Partial<any>,
  ): Promise<ApiResponse<any>> {
    try {
      const updatedFormat = await this.formatService.updatesharedcolls(Pg, colid, userId, updateData);

      if (!updatedFormat) {
        return new ApiResponse(false, null, 'Format not found', HttpStatus.NOT_FOUND);
      }

      // Construct the response data with the desired nested structure
      const data = {
        "Shared Col": {
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
  @Put('local-item/:Pg/:itemId')
  async updatelocalitem(
    @Param('itemId') itemId: number,
    @Body('userId') userId: number,
    @Param('Pg') Pg: number,
    @Body() updateData: Partial<any>,
  ): Promise<ApiResponse<any>> {
    try {
      const updatedFormat = await this.formatService.updatelocalitem(Pg, itemId, userId, updateData);

      if (!updatedFormat) {
        return new ApiResponse(false, null, 'Format not found', HttpStatus.NOT_FOUND);
      }

      // Construct the response data with the desired nested structure
      const data = {
        "Local Item": {
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
  @Put('shared-item/:Pg/:itemId')
  async updateshareditem(
    @Param('itemId') itemId: number,
    @Body('userId') userId: number,
    @Param('Pg') Pg: number,
    @Body() updateData: Partial<any>,
  ): Promise<ApiResponse<any>> {
    try {
      const updatedFormat = await this.formatService.updateshareditem(Pg, itemId, userId, updateData);

      if (!updatedFormat) {
        return new ApiResponse(false, null, 'Format not found', HttpStatus.NOT_FOUND);
      }

      // Construct the response data with the desired nested structure
      const data = {
        "Shared Item": {
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
  @Put('local-row/:Pg/:rowid')
async updatelocalrow(
  @Param('rowid') rowId: number,
  @Param('Pg') Pg: number,
  @Body() updateData: Partial<any>,
): Promise<ApiResponse<any>> {
  try {
    // Call the service method to validate and update the format entry
    const updatedFormat = await this.formatService.updatelocalrow(Pg, rowId, updateData);

    if (!updatedFormat) {
      return new ApiResponse(false, null, 'Format not found', HttpStatus.NOT_FOUND);
    }

    // Retrieve the User details from the updated Format entry
    const user = updatedFormat.User; // Assuming Format has a ManyToOne relationship with User

    // Construct the response data with the desired nested structure
    const data = {
     "Local Row": {
        Format: updatedFormat.Format,
        User: updateData.userId,
        local_row_ID: updatedFormat.Object,
        row_Status: updatedFormat.Status,
        row_FontStyle: updatedFormat.FontStyle,
        row_Comment: updatedFormat.Comment,
        Row_Transactions: updatedFormat.TxList,
      },
    };

    return new ApiResponse(true, data, '', HttpStatus.OK);
  } catch (error) {
    return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
  @Put('shared-row/:Pg/:rowId')
  async updatesharedrow(
    @Param('rowId') rowId: number,
    @Param('Pg') Pg: number,
    @Body() updateData: Partial<any>,
  ): Promise<ApiResponse<any>> {
    try {
      const updatedFormat = await this.formatService.updatesharedrow(Pg, rowId,  updateData);

      if (!updatedFormat) {
        return new ApiResponse(false, null, 'Format not found', HttpStatus.NOT_FOUND);
      }
    // Retrieve the User details from the updated Format entry
    const user = updatedFormat.User; // Assuming Format has a ManyToOne relationship with User

    // Construct the response data with the desired nested structure
    const data = {
      "Shared Row": {
        Format: updatedFormat.Format,
        User: updateData.userId,
        local_row_ID: updatedFormat.Object,
        row_Status: updatedFormat.Status,
        row_FontStyle: updatedFormat.FontStyle,
        row_Comment: updatedFormat.Comment,
        Row_Transactions: updatedFormat.TxList,
      },
    };

      return new ApiResponse(true, data, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Put('local-cell/:Pg/:colId/:rowId')
  async updatelocalCell(
    @Param('colId') colId: number,
    @Param('rowId') rowId: number,
    @Param('Pg') Pg: number,
    @Body('userId') userId: number,
    @Body() updateData: Partial<any>
  ): Promise<ApiResponse<any>> {
    try {
      const updatedFormat = await this.formatService.updatelocalCell(Pg, colId, rowId, userId, updateData);
      if (!updatedFormat) {
        return new ApiResponse(false, null, 'Format not found', HttpStatus.NOT_FOUND);
      }

      // Construct the response data with the desired nested structure
      const data = {
        "Local Cell": {
          Format: updateData.Format || updatedFormat.Format,
          User: updateData.User || updatedFormat.User,
          Cell_ID: updatedFormat.Object || updatedFormat.Object,
          Datatype: updatedFormat.cell.DataType,
          DropDownSource: updatedFormat.cell.DropDownSource,
          DefaultData: updateData.Default || updatedFormat.Default,
          Status: updateData.Status || updatedFormat.Status,
          Formula: updateData.Formula || updatedFormat.Formula,
          FontStyle: updateData.FontStyle || updatedFormat.FontStyle,
          Comment: updateData.Comment || updatedFormat.Comment,
          Transactions: updateData.TxList || updatedFormat.TxList,
        },
      };

      return new ApiResponse(true, data, '', HttpStatus.OK);
    } catch (error) {
      console.error(error); // Log the error for debugging purposes
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Put('shared-cell/:Pg/:colId/:rowId')
  async updatesharedCell(
    @Param('Pg') Pg: number,
    @Param('colId') colId: number,
    @Param('rowId') rowId: number,
    @Body('userId') userId: number,
    @Body() updateData: Partial<any>
  ): Promise<ApiResponse<any>> {
    try {
      const updatedFormat = await this.formatService.updatesharedCell(Pg, colId, rowId, userId, updateData);
      if (!updatedFormat) {
        return new ApiResponse(false, null, 'Format not found', HttpStatus.NOT_FOUND);
      }

      // Construct the response data with the desired nested structure
      const data = {
        "Shared Cell": {
          Format: updateData.Format || updatedFormat.Format,
          User: updateData.User || updatedFormat.User,
          Cell_ID: updatedFormat.Object || updatedFormat.Object,
          Datatype: updatedFormat.cell.DataType,
          DropDownSource: updatedFormat.cell.DropDownSource,
          DefaultData: updateData.Default || updatedFormat.Default,
          Status: updateData.Status || updatedFormat.Status,
          Formula: updateData.Formula || updatedFormat.Formula,
          FontStyle: updateData.FontStyle || updatedFormat.FontStyle,
          Comment: updateData.Comment || updatedFormat.Comment,
          Transactions: updateData.TxList || updatedFormat.TxList,
        },
      };

      return new ApiResponse(true, data, '', HttpStatus.OK);
    } catch (error) {
      console.error(error); // Log the error for debugging purposes
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
