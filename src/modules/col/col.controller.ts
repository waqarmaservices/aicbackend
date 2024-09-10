import { Controller, Get, Post, Put, Delete, Param, Body, HttpStatus } from '@nestjs/common';
import { ColService } from './col.service';
import { ApiResponse } from '../../common/dtos/api-response.dto';
import { Col } from './col.entity';
import { Column } from 'typeorm';

@Controller('col')
export class ColController {
  constructor(private readonly colService: ColService) {}
  @Post()
  async createCol(): Promise<ApiResponse<any>> {
    try {
      const col = await this.colService.createCol();
      if (!col) {
        return new ApiResponse(false, null, 'Col not found', HttpStatus.NOT_FOUND);
      }

      // Wrap the Pg attribute inside the Page object
      const data = {
        Column: {
          Col: col.Col,
        },
      };
      return new ApiResponse(true, data, '', HttpStatus.CREATED);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Get()
  async findAll(): Promise<ApiResponse<any>> {
    try {
      const cols = await this.colService.findAll();
      return new ApiResponse(true, cols, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ApiResponse<any>> {
    try {
      const col = await this.colService.findOne(id);
      if (!col) {
        return new ApiResponse(false, null, 'Col not found', HttpStatus.NOT_FOUND);
      }

      // Wrap the Pg attribute inside the Page object
      const data = {
        Column: {
          Col: col.Col,
        },
      };
      return new ApiResponse(true, data, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Put(':id')
  async updateCol(@Param('id') id: number, @Body() updateData: Partial<Col>): Promise<ApiResponse<any>> {
    try {
      const updatedCol = await this.colService.updateCol(id, updateData);
      if (!updatedCol) {
        return new ApiResponse(false, null, 'Col not found', HttpStatus.NOT_FOUND);
      }

      // Wrap the Pg attribute inside the Page object
      const data = {
        Column: {
          Col: updatedCol.Col,
        },
      };
      return new ApiResponse(true, data, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Delete(':id')
  async deleteCol(@Param('id') id: number): Promise<ApiResponse<any>> {
    try {
      const deletedColumn = await this.colService.deleteCol(id);
      // If the column was not found (i.e., deletedColumn is null), return a 404 response
      if (!deletedColumn) {
        return new ApiResponse(false, null, 'Col not found', HttpStatus.NOT_FOUND);
      }

      // Wrap the Pg attribute inside the Page object
      const data = {
        Deleted_Column: {
          Col: deletedColumn,
        },
      };
      return new ApiResponse(true, data, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  // Create Page with Format record
  @Post('createcolformat')
  async createPageWithFormat(): Promise<ApiResponse<any>> {
    try {
      // Call the service to create the Columns and Format
      const result = await this.colService.createColAndFormat();

      // Structure the response data
      const responseData = {
        Columns_Format: {
          Column: {
            Col: result.createdcol.Col,
          },
          Format: {
            Format: result.createdFormat.Format,
            Object: result.createdFormat.Object,
            User: result.createdFormat.User,
            ObjectType: result.createdFormat.ObjectType,
          },
        },
      };

      return new ApiResponse(true, responseData, '', HttpStatus.CREATED);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Post('createColAndRow')
  async createColAndRow(@Body() payload: any): Promise<ApiResponse<any>> {
    try {
      // Call the service function that handles both column and row creation
      const { createdCol, createdRow } = await this.colService.createColAndRow(payload);

      if (!createdRow) {
        return new ApiResponse(false, null, 'Row not created', HttpStatus.NOT_FOUND);
      }

      // Construct the response structure
      const responseData = {
        'Add-Row': {
          createdCol: {
            Col: createdCol.Col,
            
          },
          createdRow: {
            Row: createdRow.Row,
            Pg: createdRow.Pg,
            Share: createdRow.Share,
            Inherit: createdRow.Inherit,
            RowType: createdRow.RowType,
            RowLevel: createdRow.RowLevel,
            ParentRow: createdRow.ParentRow,
            SiblingRow: createdRow.SiblingRow,
          },
        },
      };

      return new ApiResponse(true, responseData, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
